import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyCodeSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  code: z.string().length(6, '6자리 인증 코드를 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = verifyCodeSchema.parse(body)

    // 인증 토큰 조회
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: code,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: '인증 코드가 일치하지 않습니다.' },
        { status: 400 }
      )
    }

    // 만료 확인
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: '인증 코드가 만료되었습니다. 다시 요청해주세요.' },
        { status: 400 }
      )
    }

    // 인증 성공 - 토큰을 verified 상태로 업데이트 (token 값을 verified_{email}로 변경)
    const verifiedToken = `verified_${Date.now()}_${email}`
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: {
        token: verifiedToken,
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30분 연장
      },
    })

    return NextResponse.json({
      message: '이메일 인증이 완료되었습니다.',
      success: true,
      verifiedToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: '인증 코드 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
