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

    // 만료 상태 자동 업데이트
    const now = new Date()
    const updatedCoupons = coupons.map((coupon) => {
      if (coupon.status === 'ACTIVE' && coupon.expiresAt < now) {
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
