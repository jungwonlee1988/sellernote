import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 난이도 순서 변경
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { levels } = await request.json()

    if (!Array.isArray(levels)) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 순서 업데이트
    await prisma.$transaction(
      levels.map((item: { id: string; order: number }) =>
        prisma.level.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({ message: '순서가 변경되었습니다.' })
  } catch (error) {
    console.error('Reorder levels error:', error)
    return NextResponse.json(
      { error: '순서 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
