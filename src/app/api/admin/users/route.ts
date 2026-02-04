import { prisma } from '@/lib/prisma'
import { withAdmin, successResponse } from '@/lib/api'

export const GET = withAdmin(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          posts: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return successResponse(users)
})
