import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getReferralStats, REFERRAL_REWARDS, generateUniqueReferralCode } from '@/lib/referral'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 내 리퍼럴 코드 조회
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        referralCode: true,
        referredBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 기존 사용자의 경우 추천 코드가 없으면 생성
    if (!user.referralCode) {
      const newReferralCode = await generateUniqueReferralCode()
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: newReferralCode },
        select: {
          id: true,
          referralCode: true,
          referredBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    // 리퍼럴 통계 조회
    const stats = await getReferralStats(session.user.id)

    return NextResponse.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      stats,
      rewards: REFERRAL_REWARDS,
    })
  } catch (error) {
    console.error('Failed to fetch referral info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral info' },
      { status: 500 }
    )
  }
}
