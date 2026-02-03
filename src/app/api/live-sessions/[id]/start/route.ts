import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRoom } from '@/lib/livekit'

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
        { error: '수업 시작 권한이 없습니다.' },
        { status: 403 }
      )
    }

    if (liveSession.status === 'LIVE') {
      return NextResponse.json(
        { error: '이미 진행 중인 수업입니다.' },
        { status: 400 }
      )
    }

    if (liveSession.status === 'ENDED' || liveSession.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '종료되었거나 취소된 수업은 시작할 수 없습니다.' },
        { status: 400 }
      )
    }

    // LiveKit 룸 생성
    try {
      await createRoom(liveSession.roomId, liveSession.maxParticipants)
    } catch (error) {
      console.error('Failed to create LiveKit room:', error)
      // 룸 생성 실패해도 계속 진행 (이미 존재할 수 있음)
    }

    const updated = await prisma.liveSession.update({
      where: { id },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
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

    return NextResponse.json({
      message: '수업이 시작되었습니다.',
      session: updated,
    })
  } catch (error) {
    console.error('Live session start error:', error)
    return NextResponse.json(
      { error: '수업 시작에 실패했습니다.' },
      { status: 500 }
    )
  }
}
