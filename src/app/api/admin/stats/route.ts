import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      totalCourses,
      totalPosts,
      totalPayments,
      newUsersThisMonth,
      newEnrollmentsThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.post.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.enrollment.count({
        where: { enrolledAt: { gte: startOfMonth } },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalPosts,
      totalRevenue: totalPayments._sum.amount || 0,
      newUsersThisMonth,
      newEnrollmentsThisMonth,
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
