import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  maxScore: z.number().min(1).max(1000).optional(),
  passingScore: z.number().min(0).optional(),
  allowLateSubmission: z.boolean().optional(),
  latePenaltyPercent: z.number().min(0).max(100).optional(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
})

export async function GET(
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
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 일반 사용자는 공개된 과제만, 수강 중인지 확인
    if (session.user.role === 'USER') {
      if (assignment.status !== 'PUBLISHED') {
        return NextResponse.json(
          { error: '과제를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

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

      // 내 제출 정보 추가
      const submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId: id,
            userId: session.user.id,
          },
        },
      })

      return NextResponse.json({
        ...assignment,
        mySubmission: submission,
      })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Assignment fetch error:', error)
    return NextResponse.json(
      { error: '과제 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const validated = updateAssignmentSchema.parse(body)

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description && { description: validated.description }),
        ...(validated.instructions !== undefined && {
          instructions: validated.instructions,
        }),
        ...(validated.dueDate !== undefined && {
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        }),
        ...(validated.maxScore && { maxScore: validated.maxScore }),
        ...(validated.passingScore !== undefined && {
          passingScore: validated.passingScore,
        }),
        ...(validated.allowLateSubmission !== undefined && {
          allowLateSubmission: validated.allowLateSubmission,
        }),
        ...(validated.latePenaltyPercent !== undefined && {
          latePenaltyPercent: validated.latePenaltyPercent,
        }),
        ...(validated.attachments && { attachments: validated.attachments }),
        ...(validated.status && { status: validated.status }),
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

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Assignment update error:', error)
    return NextResponse.json(
      { error: '과제 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      include: {
        _count: { select: { submissions: true } },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (assignment._count.submissions > 0) {
      return NextResponse.json(
        { error: '제출된 과제가 있어 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({ message: '과제가 삭제되었습니다.' })
  } catch (error) {
    console.error('Assignment delete error:', error)
    return NextResponse.json(
      { error: '과제 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
