import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        usedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 만료 상태 자동 업데이트 (DB에도 반영)
    const now = new Date()
    const expiredCouponIds = coupons
      .filter((coupon) => coupon.status === 'ACTIVE' && coupon.expiresAt < now)
      .map((coupon) => coupon.id)

    if (expiredCouponIds.length > 0) {
      await prisma.coupon.updateMany({
        where: { id: { in: expiredCouponIds } },
        data: { status: 'EXPIRED' },
      })
    }

    const updatedCoupons = coupons.map((coupon) => {
      if (expiredCouponIds.includes(coupon.id)) {
        return { ...coupon, status: 'EXPIRED' as const }
      }
      return coupon
    })

    return NextResponse.json(updatedCoupons)
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}
