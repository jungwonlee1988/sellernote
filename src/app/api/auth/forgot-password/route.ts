import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail, generateVerificationToken } from '@/lib/email'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 보안상 사용자 존재 여부와 관계없이 같은 응답 반환
    if (!user) {
      return NextResponse.json({
        message: '해당 이메일로 비밀번호 재설정 링크를 발송했습니다.',
      })
    }

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // 새 토큰 생성
    const token = generateVerificationToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후 만료

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // 이메일 발송
    const emailResult = await sendPasswordResetEmail(email, token)

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
    }

    return NextResponse.json({
      message: '해당 이메일로 비밀번호 재설정 링크를 발송했습니다.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
