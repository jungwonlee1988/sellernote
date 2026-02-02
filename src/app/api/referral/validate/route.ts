import { NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/referral'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: '추천 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    const result = await validateReferralCode(code)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to validate referral code:', error)
    return NextResponse.json(
      { valid: false, error: '추천 코드 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
