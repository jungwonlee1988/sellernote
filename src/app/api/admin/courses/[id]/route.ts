import { prisma } from '@/lib/prisma'
import {
  withAdmin,
  successResponse,
  errorResponse,
  NotFoundError,
  ValidationError,
} from '@/lib/api'
import { updateCourseSchema } from '@/lib/validations'
import { z } from 'zod'

export const GET = withAdmin(async (_request, context) => {
  const { id } = await context!.params

  const course = await prisma.course.findUnique({
    where: { id },
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
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
    },
  })

  if (!course) {
    throw new NotFoundError('강의를 찾을 수 없습니다.')
  }

  return successResponse(course)
})

export const PATCH = withAdmin(async (request, context) => {
  try {
    const { id } = await context!.params
    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      throw new NotFoundError('강의를 찾을 수 없습니다.')
    }

    const { lessons, schedules, tagIds, ...courseData } = validatedData

    const updateData: Record<string, unknown> = {}

    const allowedFields = [
      'title',
      'description',
      'price',
      'thumbnail',
      'category',
      'level',
      'instructor',
      'isPublished',
      'capacity',
      'vodEnabled',
      'vodFreeDays',
      'vodPrice',
      'vodExpiryDays',
      'courseType',
    ] as const

    for (const field of allowedFields) {
      if (field in courseData && courseData[field as keyof typeof courseData] !== undefined) {
        updateData[field] = courseData[field as keyof typeof courseData]
      }
    }

    if ('startDate' in courseData) {
      updateData.startDate = courseData.startDate ? new Date(courseData.startDate) : null
    }
    if ('endDate' in courseData) {
      updateData.endDate = courseData.endDate ? new Date(courseData.endDate) : null
    }

    await prisma.course.update({
      where: { id },
      data: updateData,
    })

    if (lessons) {
      await prisma.lesson.deleteMany({
        where: { courseId: id },
      })

      if (lessons.length > 0) {
        await prisma.lesson.createMany({
          data: lessons.map((lesson, index) => ({
            courseId: id,
            title: lesson.title,
            content: lesson.content || null,
            videoUrl: lesson.videoUrl || null,
            duration: lesson.duration || null,
            order: lesson.order ?? index + 1,
            isPublic: lesson.isPublic || false,
          })),
        })
      }
    }

    if (schedules) {
      await prisma.courseSchedule.deleteMany({
        where: { courseId: id },
      })

      if (schedules.length > 0) {
        await prisma.courseSchedule.createMany({
          data: schedules.map((schedule) => ({
            courseId: id,
            date: new Date(schedule.date),
            title: schedule.title || null,
          })),
        })
      }
    }

    if (tagIds !== undefined) {
      await prisma.courseTag.deleteMany({
        where: { courseId: id },
      })

      if (tagIds.length > 0) {
        await prisma.courseTag.createMany({
          data: tagIds.map((tagId: string) => ({
            courseId: id,
            tagId,
          })),
        })
      }
    }

    const result = await prisma.course.findUnique({
      where: { id },
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

    return successResponse({ message: '강의가 수정되었습니다.', course: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(new ValidationError(error.issues[0]?.message))
    }
    throw error
  }
})

export const DELETE = withAdmin(async (_request, context) => {
  const { id } = await context!.params

  const course = await prisma.course.findUnique({
    where: { id },
  })

  if (!course) {
    throw new NotFoundError('강의를 찾을 수 없습니다.')
  }

  await prisma.course.delete({
    where: { id },
  })

  return successResponse({ message: '강의가 삭제되었습니다.' })
})
