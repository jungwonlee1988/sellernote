import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/livekit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: true,
      },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수업이 예정되었거나 진행 중인지 확인
    if (!['SCHEDULED', 'LIVE'].includes(liveSession.status)) {
      return NextResponse.json(
        { error: '이 수업은 종료되었거나 취소되었습니다.' },
        { status: 400 }
      )
    }

    const isInstructor = liveSession.instructorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    // 일반 사용자는 수강 중인지 확인
    if (!isInstructor && !isAdmin) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: liveSession.courseId,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: '해당 강의를 수강 중이 아닙니다.' },
          { status: 403 }
        )
      }
    }

    // 참가자 기록 생성/업데이트
    await prisma.sessionParticipant.upsert({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId: session.user.id,
        },
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
      },
      create: {
        sessionId: id,
        userId: session.user.id,
      },
    })

    // LiveKit 토큰 생성
    const token = createToken(
      liveSession.roomId,
      session.user.name || session.user.email || 'Unknown',
      session.user.id,
      isInstructor || isAdmin
    )

    return NextResponse.json({
      token,
      roomId: liveSession.roomId,
      wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      isHost: isInstructor || isAdmin,
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: '토큰 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
