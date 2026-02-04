import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationCodeEmail, generateVerificationCode } from '@/lib/email'

const sendCodeSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = sendCodeSchema.parse(body)

    // 이미 가입된 이메일인지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 기존 인증 토큰 삭제
    await prisma.verificationToken.deleteMany({
      where: { email },
    })

    // 6자리 인증 코드 생성
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10분 후 만료

    // 인증 토큰 저장 (code를 token 필드에 저장)
    await prisma.verificationToken.create({
      data: {
        email,
        token: code,
        expires,
      },
    })

    // 인증 코드 이메일 발송
    const emailResult = await sendVerificationCodeEmail(email, code)

    if (!emailResult.success) {
      console.error('Failed to send verification code:', emailResult.error)
      return NextResponse.json(
        { error: `이메일 발송 실패: ${emailResult.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '인증 코드가 발송되었습니다.',
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Send code error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `인증 코드 발송 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    )
  }
}
