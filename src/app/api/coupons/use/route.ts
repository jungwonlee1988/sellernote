import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { applyCoupon } from '@/lib/coupon'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: '쿠폰 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    const result = await applyCoupon(code, session.user.id)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to use coupon:', error)
    return NextResponse.json(
      { success: false, error: '쿠폰 사용 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
