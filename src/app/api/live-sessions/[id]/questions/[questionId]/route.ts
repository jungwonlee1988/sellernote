import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const answerSchema = z.object({
  answer: z.string().min(1).max(2000),
  status: z.enum(['ANSWERED', 'DISMISSED']).default('ANSWERED'),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, questionId } = await params

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
        { error: '답변 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const question = await prisma.liveQuestion.findUnique({
      where: { id: questionId },
    })

    if (!question || question.sessionId !== id) {
      return NextResponse.json(
        { error: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = answerSchema.parse(body)

    const updated = await prisma.liveQuestion.update({
      where: { id: questionId },
      data: {
        answer: validated.answer,
        status: validated.status,
        answeredAt: new Date(),
        answeredById: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        answeredBy: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Question answer error:', error)
    return NextResponse.json(
      { error: '답변 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  // POST는 upvote 토글용
  try {
    const session = await getServerSession(authOptions)
    const { id, questionId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const question = await prisma.liveQuestion.findUnique({
      where: { id: questionId },
    })

    if (!question || question.sessionId !== id) {
      return NextResponse.json(
        { error: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 기존 추천 확인
    const existingUpvote = await prisma.questionUpvote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId: session.user.id,
        },
      },
    })

    if (existingUpvote) {
      // 추천 취소
      await prisma.$transaction([
        prisma.questionUpvote.delete({
          where: { id: existingUpvote.id },
        }),
        prisma.liveQuestion.update({
          where: { id: questionId },
          data: { upvotes: { decrement: 1 } },
        }),
      ])

      return NextResponse.json({ upvoted: false })
    } else {
      // 추천
      await prisma.$transaction([
        prisma.questionUpvote.create({
          data: {
            questionId,
            userId: session.user.id,
          },
        }),
        prisma.liveQuestion.update({
          where: { id: questionId },
          data: { upvotes: { increment: 1 } },
        }),
      ])

      return NextResponse.json({ upvoted: true })
    }
  } catch (error) {
    console.error('Question upvote error:', error)
    return NextResponse.json(
      { error: '추천 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
