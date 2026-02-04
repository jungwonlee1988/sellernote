import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const questionSchema = z.object({
  content: z.string().min(1).max(1000),
  isAnonymous: z.boolean().default(false),
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

    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'upvotes'

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const where: Record<string, unknown> = { sessionId: id }
    if (status) {
      where.status = status
    }

    const questions = await prisma.liveQuestion.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        answeredBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { questionUpvotes: true },
        },
      },
      orderBy:
        sortBy === 'upvotes'
          ? { upvotes: 'desc' }
          : { createdAt: 'desc' },
    })

    // 익명 질문 처리 및 내가 추천했는지 확인
    const questionsWithVotes = await Promise.all(
      questions.map(async (q) => {
        const hasUpvoted = await prisma.questionUpvote.findUnique({
          where: {
            questionId_userId: {
              questionId: q.id,
              userId: session.user.id,
            },
          },
        })

        return {
          ...q,
          user: q.isAnonymous && q.userId !== session.user.id
            ? { id: 'anonymous', name: '익명', profileImage: null }
            : q.user,
          hasUpvoted: !!hasUpvoted,
        }
      })
    )

    return NextResponse.json(questionsWithVotes)
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { error: '질문 목록을 불러오는데 실패했습니다.' },
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
        { error: '진행 중인 수업에서만 질문할 수 있습니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = questionSchema.parse(body)

    const question = await prisma.liveQuestion.create({
      data: {
        sessionId: id,
        userId: session.user.id,
        content: validated.content,
        isAnonymous: validated.isAnonymous,
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    })

    return NextResponse.json(
      {
        ...question,
        user: validated.isAnonymous
          ? { id: 'anonymous', name: '익명', profileImage: null }
          : question.user,
        hasUpvoted: false,
        _count: { questionUpvotes: 0 },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Question create error:', error)
    return NextResponse.json(
      { error: '질문 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
