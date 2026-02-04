import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const progressSchema = z.object({
  lastPosition: z.number().min(0),
  watchTime: z.number().min(0),
  completed: z.boolean().optional(),
})

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

    const recording = await prisma.sessionRecording.findUnique({
      where: { id },
    })

    if (!recording) {
      return NextResponse.json(
        { error: '녹화를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = progressSchema.parse(body)

    // 완료 여부 자동 판단 (90% 이상 시청)
    const isCompleted =
      validated.completed ??
      (recording.duration
        ? validated.lastPosition >= recording.duration * 0.9
        : false)

    const viewLog = await prisma.recordingViewLog.upsert({
      where: {
        recordingId_userId: {
          recordingId: id,
          userId: session.user.id,
        },
      },
      update: {
        lastPosition: validated.lastPosition,
        watchTime: { increment: validated.watchTime },
        completed: isCompleted,
        watchedAt: new Date(),
      },
      create: {
        recordingId: id,
        userId: session.user.id,
        lastPosition: validated.lastPosition,
        watchTime: validated.watchTime,
        completed: isCompleted,
      },
    })

    return NextResponse.json({
      lastPosition: viewLog.lastPosition,
      watchTime: viewLog.watchTime,
      completed: viewLog.completed,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: '진행도 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}
