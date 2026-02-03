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
    isPublic: z.boolean().optional(),
  })).optional(),
  schedules: z.array(z.object({
    date: z.string(),
    title: z.string().nullable().optional(),
  })).optional(),
  tagIds: z.array(z.string()).optional(),
}).strict()

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
    const { lessons, schedules, tagIds } = validatedData

    // 강의 업데이트 데이터 준비 (명시적으로 허용된 필드만 포함)
    const updateData: Record<string, unknown> = {}

    // 허용된 필드 목록
    const allowedFields = [
      'title', 'subtitle', 'description', 'price', 'thumbnail',
      'category', 'level', 'instructor', 'isPublished',
      'capacity', 'location', 'locationAddress', 'locationUrl',
      'educationTime', 'targetAudience', 'benefits'
    ] as const

    for (const field of allowedFields) {
      if (field in validatedData && validatedData[field] !== undefined) {
        updateData[field] = validatedData[field]
      }
    }

    // 날짜 필드 변환
    if ('startDate' in validatedData) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null
    }
    if ('endDate' in validatedData) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    }
    if ('earlyBirdEndDate' in validatedData) {
      updateData.earlyBirdEndDate = validatedData.earlyBirdEndDate ? new Date(validatedData.earlyBirdEndDate) : null
    }
    if ('earlyBirdPrice' in validatedData) {
      updateData.earlyBirdPrice = validatedData.earlyBirdPrice
    }

    // search_vector 컬럼 존재 여부 확인 및 추가 (트리거 호환성)
    const columnCheck = await prisma.$queryRaw<{exists: boolean}[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Course' AND column_name = 'search_vector'
      ) as exists
    `
    if (!columnCheck[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
      `
    }

    // 강의 업데이트
    await prisma.course.update({
      where: { id },
      data: {
        title: updateData.title as string | undefined,
        subtitle: updateData.subtitle as string | null | undefined,
        description: updateData.description as string | undefined,
        price: updateData.price as number | undefined,
        thumbnail: updateData.thumbnail as string | null | undefined,
        category: updateData.category as string | undefined,
        level: updateData.level as string | undefined,
        instructor: updateData.instructor as string | undefined,
        isPublished: updateData.isPublished as boolean | undefined,
        capacity: updateData.capacity as number | null | undefined,
        earlyBirdPrice: updateData.earlyBirdPrice as number | null | undefined,
        earlyBirdEndDate: updateData.earlyBirdEndDate as Date | null | undefined,
        location: updateData.location as string | null | undefined,
        locationAddress: updateData.locationAddress as string | null | undefined,
        locationUrl: updateData.locationUrl as string | null | undefined,
        educationTime: updateData.educationTime as string | null | undefined,
        targetAudience: updateData.targetAudience as string[] | undefined,
        benefits: updateData.benefits as string[] | undefined,
        startDate: updateData.startDate as Date | null | undefined,
        endDate: updateData.endDate as Date | null | undefined,
      },
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
            isPublic: lesson.isPublic || false,
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
      // Zod 유효성 검사 오류 상세 메시지
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.')
        return path ? `${path}: ${issue.message}` : issue.message
      })
      return NextResponse.json(
        {
          error: '입력값 오류',
          details: errorMessages,
          message: errorMessages.join(', ')
        },
        { status: 400 }
      )
    }

    console.error('Update course error:', error)

    // Prisma 오류 상세 처리
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message?: string; meta?: Record<string, unknown> }
      let errorMessage = '데이터베이스 오류가 발생했습니다.'

      switch (prismaError.code) {
        case 'P2002':
          errorMessage = '중복된 데이터가 존재합니다.'
          break
        case 'P2022':
          errorMessage = `존재하지 않는 필드가 포함되어 있습니다: ${prismaError.meta?.column || '알 수 없음'}`
          break
        case 'P2025':
          errorMessage = '해당 데이터를 찾을 수 없습니다.'
          break
        default:
          errorMessage = `데이터베이스 오류 (${prismaError.code}): ${prismaError.message || '알 수 없는 오류'}`
      }

      return NextResponse.json(
        { error: errorMessage, code: prismaError.code },
        { status: 500 }
      )
    }

    // 일반 오류
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { error: `강의 수정 중 오류: ${errorMessage}` },
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
