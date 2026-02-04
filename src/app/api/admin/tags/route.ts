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
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return successResponse(tags)
}

export const POST = withAdmin(async (request: NextRequest) => {
  const { name, color } = await request.json()

  if (!name || name.trim().length === 0) {
    throw new ValidationError('태그 이름을 입력해주세요.')
  }

  const existing = await prisma.tag.findUnique({
    where: { name: name.trim() },
  })

  if (existing) {
    throw new ConflictError('이미 존재하는 태그입니다.')
  }

  const tag = await prisma.tag.create({
    data: {
      name: name.trim(),
      color: color || '#3B82F6',
    },
  })

  return createdResponse(tag)
})
