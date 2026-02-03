import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const chatMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  messageType: z.enum(['CHAT', 'NOTICE']).default('CHAT'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { searchParams } = new URL(request.url)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const limit = parseInt(searchParams.get('limit') || '100')
    const cursor = searchParams.get('cursor')

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    })

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    })
  } catch (error) {
    console.error('Chat messages fetch error:', error)
    return NextResponse.json(
      { error: '채팅 메시지를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

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
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (liveSession.status !== 'LIVE') {
      return NextResponse.json(
        { error: '진행 중인 수업에서만 채팅할 수 있습니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = chatMessageSchema.parse(body)

    // NOTICE는 강사/관리자만 가능
    if (
      validated.messageType === 'NOTICE' &&
      liveSession.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '공지는 강사만 작성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        userId: session.user.id,
        content: validated.content,
        messageType: validated.messageType,
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Chat message create error:', error)
    return NextResponse.json(
      { error: '메시지 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
