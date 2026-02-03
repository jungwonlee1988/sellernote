import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const gradeSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(['GRADED', 'RETURNED']).default('GRADED'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, submissionId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            passingScore: true,
            courseId: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        gradedBy: {
          select: { id: true, name: true },
        },
      },
    })

    if (!submission || submission.assignmentId !== id) {
      return NextResponse.json(
        { error: '제출을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 본인 또는 강사/관리자
    if (
      submission.userId !== session.user.id &&
      !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Submission fetch error:', error)
    return NextResponse.json(
      { error: '제출 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id, submissionId } = await params

    if (!session?.user || !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    })

    if (!submission || submission.assignmentId !== id) {
      return NextResponse.json(
        { error: '제출을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = gradeSchema.parse(body)

    // 최대 점수 확인
    if (validated.score > submission.assignment.maxScore) {
      return NextResponse.json(
        { error: `점수는 ${submission.assignment.maxScore}점을 초과할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 지각 제출 감점 적용
    let finalScore = validated.score
    if (submission.isLate && submission.assignment.latePenaltyPercent > 0) {
      const penalty = Math.round(
        validated.score * (submission.assignment.latePenaltyPercent / 100)
      )
      finalScore = validated.score - penalty
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: finalScore,
        feedback: validated.feedback,
        status: validated.status,
        gradedAt: new Date(),
        gradedById: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        gradedBy: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      ...updated,
      originalScore: validated.score,
      latePenalty: submission.isLate
        ? submission.assignment.latePenaltyPercent
        : 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Grading error:', error)
    return NextResponse.json(
      { error: '채점에 실패했습니다.' },
      { status: 500 }
    )
  }
}
