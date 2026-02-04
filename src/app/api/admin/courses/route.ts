import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withAdmin,
  successResponse,
  createdResponse,
  errorResponse,
  ValidationError,
} from '@/lib/api'
import { createCourseSchema } from '@/lib/validations'
import { z } from 'zod'

export const GET = withAdmin(async () => {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          enrollments: true,
          lessons: true,
          reservations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return successResponse(courses)
})

interface LessonInput {
  title: string
  content?: string | null
  videoUrl?: string | null
  duration?: number | null
  order?: number
  isPublic?: boolean
}

interface ScheduleInput {
  date: string
  title?: string | null
}

export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    const {
      title,
      description,
      category,
      level,
      price,
      instructor,
      thumbnail,
      courseType,
      capacity,
      startDate,
      endDate,
      vodEnabled,
      vodFreeDays,
      vodPrice,
      vodExpiryDays,
      lessons,
      schedules,
      tagIds,
    } = validatedData

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        price,
        instructor,
        thumbnail: thumbnail || null,
        courseType: courseType || 'LIVE_OFFLINE',
        capacity: capacity || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        vodEnabled: vodEnabled || false,
        vodFreeDays: vodFreeDays || null,
        vodPrice: vodPrice || null,
        vodExpiryDays: vodExpiryDays || null,
        isPublished: false,
        lessons: {
          create:
            lessons?.map((lesson: LessonInput, index: number) => ({
              title: lesson.title,
              content: lesson.content || null,
              videoUrl: lesson.videoUrl || null,
              duration: lesson.duration || null,
              order: lesson.order ?? index + 1,
              isPublic: lesson.isPublic || false,
            })) || [],
        },
        schedules: {
          create:
            schedules?.map((schedule: ScheduleInput) => ({
              date: new Date(schedule.date),
              title: schedule.title || null,
            })) || [],
        },
        tags: {
          create:
            tagIds?.map((tagId: string) => ({
              tagId,
            })) || [],
        },
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        schedules: {
          orderBy: { date: 'asc' },
        },
        tags: {
          include: { tag: true },
        },
      },
    })

    return createdResponse(course)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(new ValidationError(error.issues[0]?.message))
    }
    throw error
  }
})
