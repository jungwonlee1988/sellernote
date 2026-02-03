import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  maxParticipants: z.number().min(1).max(500).optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true, instructor: true },
        },
        lesson: {
          select: { id: true, title: true },
        },
        instructor: {
          select: { id: true, name: true, profileImage: true },
        },
        recordings: {
          where: { status: 'READY' },
          select: {
            id: true,
            title: true,
            duration: true,
            createdAt: true,
          },
        },
        _count: {
          select: { participants: true, chatMessages: true, questions: true },
        },
      },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수강 중인지 확인 (일반 사용자)
    if (session?.user && session.user.role === 'USER') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: liveSession.courseId,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: '해당 강의를 수강 중이 아닙니다.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(liveSession)
  } catch (error) {
    console.error('Live session fetch error:', error)
    return NextResponse.json(
      { error: '화상 수업 정보를 불러오는데 실패했습니다.' },
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

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: '화상 수업을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인이 만든 수업이거나 관리자인지 확인
    if (
      liveSession.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 시작된 수업은 수정 불가
    if (liveSession.status === 'LIVE' || liveSession.status === 'ENDED') {
      return NextResponse.json(
        { error: '이미 시작되었거나 종료된 수업은 수정할 수 없습니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = updateSessionSchema.parse(body)

    const updated = await prisma.liveSession.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.scheduledAt && {
          scheduledAt: new Date(validated.scheduledAt),
        }),
        ...(validated.maxParticipants && {
          maxParticipants: validated.maxParticipants,
        }),
        ...(validated.status && { status: validated.status }),
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

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Live session update error:', error)
    return NextResponse.json(
      { error: '화상 수업 수정에 실패했습니다.' },
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
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    if (liveSession.status === 'LIVE') {
      return NextResponse.json(
        { error: '진행 중인 수업은 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    await prisma.liveSession.delete({
      where: { id },
    })

    return NextResponse.json({ message: '화상 수업이 삭제되었습니다.' })
  } catch (error) {
    console.error('Live session delete error:', error)
    return NextResponse.json(
      { error: '화상 수업 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
