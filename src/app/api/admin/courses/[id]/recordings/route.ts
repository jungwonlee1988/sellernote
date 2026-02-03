import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET: 강의의 모든 녹화본 조회 (원본 라이브 강의의 녹화 포함)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 강의 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sourceCourse: true,
        lessons: {
          include: {
            recording: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 녹화본을 가져올 원본 강의 ID (녹화 강의면 sourceCourse, 아니면 자신)
    const sourceCourseId = course.sourceCourseId || courseId

    // 원본 라이브 강의의 모든 녹화본 조회
    const recordings = await prisma.sessionRecording.findMany({
      where: {
        session: {
          courseId: sourceCourseId,
        },
        status: 'READY',
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      course,
      recordings,
    })
  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    return NextResponse.json(
      { error: '녹화본을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
