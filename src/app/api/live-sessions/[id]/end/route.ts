import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteRoom } from '@/lib/livekit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (
      liveSession.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '수업 종료 권한이 없습니다.' },
        { status: 403 }
      )
    }

    if (liveSession.status !== 'LIVE') {
      return NextResponse.json(
        { error: '진행 중인 수업만 종료할 수 있습니다.' },
        { status: 400 }
      )
    }

    const endedAt = new Date()
    const duration = liveSession.startedAt
      ? Math.round((endedAt.getTime() - liveSession.startedAt.getTime()) / 60000)
      : 0

    // 모든 참가자의 leftAt 업데이트
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId: id,
        leftAt: null,
      },
      data: {
        leftAt: endedAt,
      },
    })

    // LiveKit 룸 삭제
    try {
      await deleteRoom(liveSession.roomId)
    } catch (error) {
      console.error('Failed to delete LiveKit room:', error)
    }

    const updated = await prisma.liveSession.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt,
        duration,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        instructor: {
          select: { id: true, name: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    })

    return NextResponse.json({
      message: '수업이 종료되었습니다.',
      session: updated,
    })
  } catch (error) {
    console.error('Live session end error:', error)
    return NextResponse.json(
      { error: '수업 종료에 실패했습니다.' },
      { status: 500 }
    )
  }
}
