import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submissionSchema = z.object({
  content: z.string().optional(),
  attachments: z.array(z.string()).default([]),
})

export async function GET(
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

    const assignment = await prisma.assignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        gradedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    // 통계 추가
    const stats = {
      total: submissions.length,
      graded: submissions.filter((s) => s.status === 'GRADED').length,
      pending: submissions.filter((s) => s.status === 'SUBMITTED').length,
      returned: submissions.filter((s) => s.status === 'RETURNED').length,
      passed: submissions.filter(
        (s) => s.score !== null && s.score >= assignment.passingScore
      ).length,
      averageScore:
        submissions.filter((s) => s.score !== null).length > 0
          ? Math.round(
              submissions
                .filter((s) => s.score !== null)
                .reduce((acc, s) => acc + (s.score || 0), 0) /
                submissions.filter((s) => s.score !== null).length
            )
          : null,
    }

    return NextResponse.json({ submissions, stats })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { error: '제출 목록을 불러오는데 실패했습니다.' },
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

    const assignment = await prisma.assignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (assignment.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: '제출할 수 없는 과제입니다.' },
        { status: 400 }
      )
    }

    // 수강 중인지 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: assignment.courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: '해당 강의를 수강 중이 아닙니다.' },
        { status: 403 }
      )
    }

    // 이미 제출했는지 확인
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: id,
          userId: session.user.id,
        },
      },
    })

    if (existingSubmission && existingSubmission.status !== 'RETURNED') {
      return NextResponse.json(
        { error: '이미 제출한 과제입니다.' },
        { status: 400 }
      )
    }

    // 마감일 확인
    const now = new Date()
    const isLate = assignment.dueDate ? now > assignment.dueDate : false

    if (isLate && !assignment.allowLateSubmission) {
      return NextResponse.json(
        { error: '제출 기한이 지났습니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = submissionSchema.parse(body)

    if (!validated.content && validated.attachments.length === 0) {
      return NextResponse.json(
        { error: '내용 또는 첨부 파일을 추가해주세요.' },
        { status: 400 }
      )
    }

    const submission = existingSubmission
      ? await prisma.assignmentSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            content: validated.content,
            attachments: validated.attachments,
            submittedAt: now,
            isLate,
            status: 'SUBMITTED',
            score: null,
            feedback: null,
            gradedAt: null,
            gradedById: null,
          },
        })
      : await prisma.assignmentSubmission.create({
          data: {
            assignmentId: id,
            userId: session.user.id,
            content: validated.content,
            attachments: validated.attachments,
            isLate,
          },
        })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Submission create error:', error)
    return NextResponse.json(
      { error: '과제 제출에 실패했습니다.' },
      { status: 500 }
    )
  }
}
