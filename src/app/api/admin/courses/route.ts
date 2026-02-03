import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

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

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { error: '강의 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

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
      // VOD 설정
      vodEnabled,
      vodFreeDays,
      vodPrice,
      vodExpiryDays,
      lessons,
      schedules,
      tagIds,
    } = await request.json()

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
        // VOD 설정
        vodEnabled: vodEnabled || false,
        vodFreeDays: vodFreeDays || null,
        vodPrice: vodPrice || null,
        vodExpiryDays: vodExpiryDays || null,
        isPublished: false,
        lessons: {
          create: lessons?.map((lesson: LessonInput, index: number) => ({
            title: lesson.title,
            content: lesson.content || null,
            videoUrl: lesson.videoUrl || null,
            duration: lesson.duration || null,
            order: lesson.order ?? index + 1,
            isPublic: lesson.isPublic || false,
          })) || [],
        },
        schedules: {
          create: schedules?.map((schedule: ScheduleInput) => ({
            date: new Date(schedule.date),
            title: schedule.title || null,
          })) || [],
        },
        tags: {
          create: tagIds?.map((tagId: string) => ({
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

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Course create error:', error)
    return NextResponse.json(
      { error: '강의 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
