import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET: 예약 목록 조회 (관리자용)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const reservations = await prisma.courseReservation.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Failed to fetch reservations:', error)
    return NextResponse.json(
      { error: '예약 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 예약 생성
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const userId = session.user.id

    // 강의 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 정원이 설정되어 있는지 확인
    if (!course.capacity) {
      return NextResponse.json(
        { error: '정원이 설정되지 않은 강의입니다.' },
        { status: 400 }
      )
    }

    // 이미 수강 중인지 확인
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
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

    // 아직 자리가 있는지 확인
    const remainingSeats = course.capacity - course._count.enrollments
    if (remainingSeats > 0) {
      return NextResponse.json(
        { error: '아직 자리가 있습니다. 바로 수강 신청해주세요.' },
        { status: 400 }
      )
    }

    // 이미 예약했는지 확인
    const existingReservation = await prisma.courseReservation.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: '이미 예약 대기 중입니다.', reservation: existingReservation },
        { status: 400 }
      )
    }

    // 현재 대기 순번 조회
    const lastReservation = await prisma.courseReservation.findFirst({
      where: {
        courseId,
        status: 'WAITING',
      },
      orderBy: { position: 'desc' },
    })

    const position = (lastReservation?.position || 0) + 1

    // 요청 본문에서 추가 정보 추출
    let phone = null
    let message = null
    try {
      const body = await request.json()
      phone = body.phone || null
      message = body.message || null
    } catch {
      // body가 없어도 OK
    }

    // 예약 생성
    const reservation = await prisma.courseReservation.create({
      data: {
        courseId,
        userId,
        position,
        phone,
        message,
        status: 'WAITING',
      },
    })

    return NextResponse.json({
      message: '예약이 완료되었습니다.',
      position: reservation.position,
      reservation,
    })
  } catch (error) {
    console.error('Failed to create reservation:', error)
    return NextResponse.json(
      { error: '예약에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 예약 취소
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const userId = session.user.id

    const reservation = await prisma.courseReservation.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.courseReservation.update({
      where: { id: reservation.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ message: '예약이 취소되었습니다.' })
  } catch (error) {
    console.error('Failed to cancel reservation:', error)
    return NextResponse.json(
      { error: '예약 취소에 실패했습니다.' },
      { status: 500 }
    )
  }
}
