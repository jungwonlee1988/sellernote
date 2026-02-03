import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 난이도 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const levels = await prisma.level.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(levels)
  } catch (error) {
    console.error('Get levels error:', error)
    return NextResponse.json(
      { error: '난이도 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 난이도 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '난이도 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 확인
    const existing = await prisma.level.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 난이도입니다.' },
        { status: 400 }
      )
    }

    // 마지막 순서 가져오기
    const lastLevel = await prisma.level.findFirst({
      orderBy: { order: 'desc' },
    })
    const newOrder = (lastLevel?.order ?? -1) + 1

    const level = await prisma.level.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        order: newOrder,
      },
    })

    return NextResponse.json(level, { status: 201 })
  } catch (error) {
    console.error('Create level error:', error)
    return NextResponse.json(
      { error: '난이도 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
