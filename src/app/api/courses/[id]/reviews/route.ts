import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1, '별점을 선택해주세요.').max(5, '별점은 5점까지입니다.'),
  content: z.string().min(10, '수강평은 10자 이상 입력해주세요.').max(1000, '수강평은 1000자 이내로 입력해주세요.'),
})

// 강의의 수강평 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { courseId } }),
      prisma.review.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])

    // 별점별 분포
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { courseId },
      _count: { rating: true },
    })

    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const found = ratingDistribution.find((r) => r.rating === rating)
      return {
        rating,
        count: found?._count.rating || 0,
      }
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        distribution,
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: '수강평 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 수강평 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id: courseId } = await params
    const body = await request.json()
    const { rating, content } = reviewSchema.parse(body)

    // 강의 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수강 여부 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: '수강 중인 강의에만 수강평을 작성할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 이미 작성한 수강평 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 수강평을 작성하셨습니다.' },
        { status: 400 }
      )
    }

    // 수강평 생성
    const review = await prisma.review.create({
      data: {
        rating,
        content,
        userId: session.user.id,
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: '수강평이 등록되었습니다.',
        review,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Create review error:', error)
    return NextResponse.json(
      { error: '수강평 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 수강평 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id: courseId } = await params
    const body = await request.json()
    const { rating, content } = reviewSchema.parse(body)

    // 본인의 수강평 확인
    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: '수강평을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수강평 수정
    const updatedReview = await prisma.review.update({
      where: { id: review.id },
      data: { rating, content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: '수강평이 수정되었습니다.',
      review: updatedReview,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update review error:', error)
    return NextResponse.json(
      { error: '수강평 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 수강평 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id: courseId } = await params

    // 본인의 수강평 확인
    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: '수강평을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수강평 삭제
    await prisma.review.delete({
      where: { id: review.id },
    })

    return NextResponse.json({
      message: '수강평이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: '수강평 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
