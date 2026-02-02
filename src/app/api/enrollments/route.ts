import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processFirstPurchaseReferral } from '@/lib/referral'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: '강의 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 강의 존재 여부 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 수강 중인지 확인
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: '이미 수강 중인 강의입니다.' },
        { status: 400 }
      )
    }

    // 수강 신청
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
      include: {
        course: true,
      },
    })

    // 첫 결제 리퍼럴 보상 처리
    await processFirstPurchaseReferral(session.user.id)

    return NextResponse.json(
      {
        message: '수강 신청이 완료되었습니다.',
        enrollment,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: '수강 신청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Enrollments fetch error:', error)
    return NextResponse.json(
      { error: '수강 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
