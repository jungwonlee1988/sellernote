import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAssignmentSchema = z.object({
  courseId: z.string(),
  lessonId: z.string().optional(),
  title: z.string().min(1, '제목을 입력해주세요.'),
  description: z.string().min(1, '설명을 입력해주세요.'),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().min(1).max(1000).default(100),
  passingScore: z.number().min(0).default(60),
  allowLateSubmission: z.boolean().default(false),
  latePenaltyPercent: z.number().min(0).max(100).default(10),
  attachments: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

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
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (courseId) {
      where.courseId = courseId
    }

    // 일반 사용자는 공개된 과제만, 수강 중인 강의만
    if (session.user.role === 'USER') {
      where.status = 'PUBLISHED'

      const enrolledCourseIds = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      })

      where.courseId = courseId
        ? { equals: courseId, in: enrolledCourseIds.map((e) => e.courseId) }
        : { in: enrolledCourseIds.map((e) => e.courseId) }
    } else if (status) {
      where.status = status
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true },
        },
        lesson: {
          select: { id: true, title: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    })

    // 일반 사용자는 자신의 제출 정보 추가
    if (session.user.role === 'USER') {
      const assignmentsWithSubmission = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await prisma.assignmentSubmission.findUnique({
            where: {
              assignmentId_userId: {
                assignmentId: assignment.id,
                userId: session.user.id,
              },
            },
            select: {
              id: true,
              status: true,
              score: true,
              submittedAt: true,
              isLate: true,
            },
          })

          return {
            ...assignment,
            mySubmission: submission,
          }
        })
      )

      return NextResponse.json(assignmentsWithSubmission)
    }

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json(
      { error: '과제 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = createAssignmentSchema.parse(body)

    // 강의 존재 여부 확인
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: validated.courseId,
        lessonId: validated.lessonId,
        title: validated.title,
        description: validated.description,
        instructions: validated.instructions,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        maxScore: validated.maxScore,
        passingScore: validated.passingScore,
        allowLateSubmission: validated.allowLateSubmission,
        latePenaltyPercent: validated.latePenaltyPercent,
        attachments: validated.attachments,
        status: validated.status,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        lesson: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Assignment create error:', error)
    return NextResponse.json(
      { error: '과제 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
