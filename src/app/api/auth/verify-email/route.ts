import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 없습니다.' },
        { status: 400 }
      )
    }

    // 토큰 조회
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: '유효하지 않은 인증 토큰입니다.' },
        { status: 400 }
      )
    }

    // 만료 확인
    if (verificationToken.expires < new Date()) {
      // 만료된 토큰 삭제
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: '인증 토큰이 만료되었습니다. 다시 회원가입해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 이메일 인증 완료 처리
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    })

    // 사용된 토큰 삭제
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({
      message: '이메일 인증이 완료되었습니다.',
      success: true,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: '이메일 인증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
