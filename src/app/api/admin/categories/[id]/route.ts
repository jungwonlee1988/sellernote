import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 카테고리 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { name, description, color, icon, order, isActive } = await request.json()

    // 존재 확인
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이름 변경 시 중복 체크
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: name.trim() },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: '이미 존재하는 카테고리명입니다.' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: '카테고리 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 카테고리 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 존재 확인
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 해당 카테고리를 사용하는 강의 수 확인
    const courseCount = await prisma.course.count({
      where: { category: existing.name },
    })

    if (courseCount > 0) {
      return NextResponse.json(
        { error: `이 카테고리를 사용 중인 강의가 ${courseCount}개 있습니다. 먼저 강의의 카테고리를 변경해주세요.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: '카테고리가 삭제되었습니다.' })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      { error: '카테고리 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
