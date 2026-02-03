import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 난이도 수정
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
    const { name, description, isActive } = await request.json()

    // 이름 중복 확인 (자신 제외)
    if (name) {
      const existing = await prisma.level.findFirst({
        where: {
          name: name.trim(),
          id: { not: id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: '이미 존재하는 난이도 이름입니다.' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive

    const level = await prisma.level.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(level)
  } catch (error) {
    console.error('Update level error:', error)
    return NextResponse.json(
      { error: '난이도 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 난이도 삭제
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

    // 해당 난이도를 사용하는 강의가 있는지 확인
    const level = await prisma.level.findUnique({
      where: { id },
    })

    if (level) {
      const coursesCount = await prisma.course.count({
        where: { level: level.name },
      })

      if (coursesCount > 0) {
        return NextResponse.json(
          { error: `이 난이도를 사용하는 강의가 ${coursesCount}개 있습니다. 먼저 해당 강의의 난이도를 변경해주세요.` },
          { status: 400 }
        )
      }
    }

    await prisma.level.delete({
      where: { id },
    })

    return NextResponse.json({ message: '난이도가 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete level error:', error)
    return NextResponse.json(
      { error: '난이도 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
