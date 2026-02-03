import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 카테고리 목록 조회
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { name, description, color, icon } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '카테고리명을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 체크
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 순서 계산 (맨 마지막)
    const maxOrder = await prisma.category.aggregate({
      _max: { order: true },
    })
    const newOrder = (maxOrder._max.order ?? -1) + 1

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || '#6B7280',
        icon: icon || null,
        order: newOrder,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json(
      { error: '카테고리 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
