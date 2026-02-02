import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 본인의 수강 내역인지 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: '수강 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (enrollment.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 수료된 경우
    if (enrollment.completedAt) {
      return NextResponse.json({
        message: '이미 수료된 강의입니다.',
        enrollment,
      })
    }

    // 수료 처리
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: '수료 처리가 완료되었습니다.',
      enrollment: updatedEnrollment,
    })
  } catch (error) {
    console.error('Enrollment complete error:', error)
    return NextResponse.json(
      { error: '수료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
