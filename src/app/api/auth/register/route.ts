import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  generateUniqueReferralCode,
  validateReferralCode,
  processSignupReferral,
} from '@/lib/referral'

const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
  verifiedToken: z.string().min(1, '이메일 인증이 필요합니다.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // 이메일 인증 확인
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email: validatedData.email,
        token: validatedData.verifiedToken,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: '이메일 인증이 완료되지 않았습니다.' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: '인증이 만료되었습니다. 다시 시도해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // 추천 코드 검증 (있는 경우)
    let referrerId: string | null = null
    if (validatedData.referralCode) {
      const referralValidation = await validateReferralCode(validatedData.referralCode)
      if (referralValidation.valid && referralValidation.referrer) {
        referrerId = referralValidation.referrer.id
      }
    }

    // 새 사용자의 고유 추천 코드 생성
    const newReferralCode = await generateUniqueReferralCode()

    // 사용자 생성 (이메일 인증 완료 상태로)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone || null,
        referralCode: newReferralCode,
        referredById: referrerId,
        emailVerified: new Date(),
      },
    })

    // 추천인이 있으면 보상 처리
    if (referrerId) {
      await processSignupReferral(referrerId, user.id)
    }

    // 사용된 인증 토큰 삭제
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
