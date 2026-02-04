import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  withAdmin,
  successResponse,
  createdResponse,
  ValidationError,
  ConflictError,
} from '@/lib/api'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  })

  return successResponse(categories)
}

export const POST = withAdmin(async (request: NextRequest) => {
  const { name, description, color, icon } = await request.json()

  if (!name || !name.trim()) {
    throw new ValidationError('카테고리명을 입력해주세요.')
  }

  const existing = await prisma.category.findUnique({
    where: { name: name.trim() },
  })

  if (existing) {
    throw new ConflictError('이미 존재하는 카테고리입니다.')
  }

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

  return createdResponse(category)
})
