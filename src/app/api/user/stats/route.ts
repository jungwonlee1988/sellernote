import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 수강 중인 강의 수 (completedAt이 null인 경우)
    const enrolledCourses = await prisma.enrollment.count({
      where: {
        userId,
        completedAt: null,
      },
    })

    // 완료한 강의 수 (completedAt이 있는 경우)
    const completedCourses = await prisma.enrollment.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    })

    // 작성한 게시글 수
    const postsCount = await prisma.post.count({
      where: { authorId: userId },
    })

    return NextResponse.json({
      enrolledCourses,
      completedCourses,
      postsCount,
    })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
