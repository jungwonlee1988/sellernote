import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  thumbnail: z.string().nullable().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  instructor: z.string().optional(),
  isPublished: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  // 오프라인 교육 관련 필드
  capacity: z.number().nullable().optional(),
  earlyBirdPrice: z.number().nullable().optional(),
  earlyBirdEndDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  locationAddress: z.string().nullable().optional(),
  locationUrl: z.string().nullable().optional(),
  educationTime: z.string().nullable().optional(),
  targetAudience: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  // Relations
  lessons: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    content: z.string().nullable().optional(),
    videoUrl: z.string().nullable().optional(),
    duration: z.number().nullable().optional(),
    order: z.number(),
  })).optional(),
  schedules: z.array(z.object({
    date: z.string(),
    title: z.string().nullable().optional(),
  })).optional(),
  tagIds: z.array(z.string()).optional(),
})

// 강의 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { id } = await params

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
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: '강의 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 강의 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // 강의 존재 확인
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // lessons, schedules, tagIds 분리
    const { lessons, schedules, tagIds, startDate, endDate, earlyBirdEndDate, ...courseData } = validatedData

    // 강의 업데이트 데이터 준비
    const updateData: Record<string, unknown> = { ...courseData }
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null
    }
    if (earlyBirdEndDate !== undefined) {
      updateData.earlyBirdEndDate = earlyBirdEndDate ? new Date(earlyBirdEndDate) : null
    }

    // 강의 업데이트
    await prisma.course.update({
      where: { id },
      data: updateData,
    })

    // 레슨 업데이트 (있는 경우)
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
          })),
        })
      }
    }

    // 일정 업데이트 (있는 경우)
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

    // 태그 업데이트 (있는 경우)
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

    // 업데이트된 강의 반환
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

    return NextResponse.json({
      message: '강의가 수정되었습니다.',
      course: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update course error:', error)
    return NextResponse.json(
      { error: '강의 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 강의 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json({
      message: '강의가 삭제되었습니다.',
    })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: '강의 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
