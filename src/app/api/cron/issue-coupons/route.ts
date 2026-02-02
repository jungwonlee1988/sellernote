import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueCouponCode, updateExpiredCoupons } from '@/lib/coupon'
import { sendCouponIssuedEmail } from '@/lib/email'

const COUPON_AMOUNT = 30000
const COUPON_VALIDITY_MONTHS = 3

export async function GET(request: Request) {
  // Vercel Cron 인증 (선택사항: CRON_SECRET 환경변수 설정 시)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. 만료된 쿠폰 상태 업데이트
    const expiredCount = await updateExpiredCoupons()
    console.log(`Updated ${expiredCount} expired coupons`)

    // 2. 수강 종료일이 지난 enrollment 조회 (이미 쿠폰이 발급되지 않은 것만)
    const now = new Date()
    const eligibleEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          endDate: {
            lt: now,
          },
        },
        coupon: null, // 아직 쿠폰이 발급되지 않음
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // 3. 각 enrollment에 대해 REFUNDED가 아닌 Payment가 있는지 확인
    const issuedCoupons: string[] = []
    const emailErrors: string[] = []

    for (const enrollment of eligibleEnrollments) {
      // REFUNDED가 아닌 COMPLETED 결제가 있는지 확인
      const validPayment = await prisma.payment.findFirst({
        where: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          status: 'COMPLETED',
        },
      })

      if (!validPayment) {
        continue // 유효한 결제가 없으면 건너뜀
      }

      // 환불된 결제가 있는지 확인
      const refundedPayment = await prisma.payment.findFirst({
        where: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          status: 'REFUNDED',
        },
      })

      if (refundedPayment) {
        continue // 환불된 경우 건너뜀
      }

      // 쿠폰 발급
      const code = await generateUniqueCouponCode()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + COUPON_VALIDITY_MONTHS)

      const coupon = await prisma.coupon.create({
        data: {
          code,
          ownerId: enrollment.userId,
          enrollmentId: enrollment.id,
          amount: COUPON_AMOUNT,
          expiresAt,
        },
      })

      issuedCoupons.push(coupon.code)

      // 이메일 발송
      const emailResult = await sendCouponIssuedEmail(
        enrollment.user.email,
        enrollment.user.name,
        enrollment.course.title,
        code,
        COUPON_AMOUNT,
        expiresAt
      )

      if (!emailResult.success) {
        emailErrors.push(`Failed to send email to ${enrollment.user.email}: ${emailResult.error}`)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        expiredCouponsUpdated: expiredCount,
        eligibleEnrollments: eligibleEnrollments.length,
        couponsIssued: issuedCoupons.length,
        emailErrors: emailErrors.length,
      },
      issuedCoupons,
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
