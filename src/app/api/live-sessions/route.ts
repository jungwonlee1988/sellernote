import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRoomId } from '@/lib/livekit'
import { z } from 'zod'

const createSessionSchema = z.object({
  courseId: z.string(),
  lessonId: z.string().optional(),
  title: z.string().min(1, '제목을 입력해주세요.'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  maxParticipants: z.number().min(1).max(500).default(100),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: Record<string, unknown> = {}

    if (courseId) {
      where.courseId = courseId
    }

    if (status) {
      where.status = status
    }

    if (upcoming) {
      where.scheduledAt = { gte: new Date() }
      where.status = { in: ['SCHEDULED', 'LIVE'] }
    }

    // 수강 중인 강의의 세션만 조회 (일반 사용자)
    if (session?.user && session.user.role === 'USER') {
      const enrolledCourseIds = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })
      where.courseId = { in: enrolledCourseIds.map((e) => e.courseId) }
    }

    const sessions = await prisma.liveSession.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
        instructor: {
          select: { id: true, name: true, profileImage: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Live sessions fetch error:', error)
    return NextResponse.json(
      { error: '화상 수업 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = createSessionSchema.parse(body)

    // 강의 존재 여부 확인
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const roomId = generateRoomId()

    const liveSession = await prisma.liveSession.create({
      data: {
        courseId: validated.courseId,
        lessonId: validated.lessonId,
        instructorId: session.user.id,
        title: validated.title,
        description: validated.description,
        roomId,
        scheduledAt: new Date(validated.scheduledAt),
        maxParticipants: validated.maxParticipants,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        instructor: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(liveSession, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Live session create error:', error)
    return NextResponse.json(
      { error: '화상 수업 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
