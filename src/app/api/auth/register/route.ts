import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

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

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone || null,
      },
    })

    // 이메일 인증 토큰 생성
    const token = generateVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후 만료

    await prisma.verificationToken.create({
      data: {
        email: validatedData.email,
        token,
        expires,
      },
    })

    // 인증 이메일 발송
    const emailResult = await sendVerificationEmail(validatedData.email, token)

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
    }

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        emailSent: emailResult.success,
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
