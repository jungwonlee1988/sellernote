import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const courseId = searchParams.get('courseId')
    const sessionId = searchParams.get('sessionId')

    const where: Record<string, unknown> = {
      status: 'READY',
    }

    if (sessionId) {
      where.sessionId = sessionId
    }

    // 수강 중인 강의의 녹화만 조회 (일반 사용자)
    if (session.user.role === 'USER') {
      const enrolledCourseIds = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })

      where.session = {
        courseId: courseId
          ? { equals: courseId, in: enrolledCourseIds.map((e) => e.courseId) }
          : { in: enrolledCourseIds.map((e) => e.courseId) },
      }
    } else if (courseId) {
      where.session = { courseId }
    }

    const recordings = await prisma.sessionRecording.findMany({
      where,
      include: {
        session: {
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true },
            },
            instructor: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 시청 기록 추가
    const recordingsWithProgress = await Promise.all(
      recordings.map(async (recording) => {
        const viewLog = await prisma.recordingViewLog.findUnique({
          where: {
            recordingId_userId: {
              recordingId: recording.id,
              userId: session.user.id,
            },
          },
        })

        return {
          ...recording,
          viewProgress: viewLog
            ? {
                lastPosition: viewLog.lastPosition,
                watchTime: viewLog.watchTime,
                completed: viewLog.completed,
              }
            : null,
        }
      })
    )

    return NextResponse.json(recordingsWithProgress)
  } catch (error) {
    console.error('Recordings fetch error:', error)
    return NextResponse.json(
      { error: '녹화 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
