import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST: 라이브 강의에서 녹화 강의 생성
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: sourceCourseId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { title, price, description } = await request.json()

    // 원본 강의 조회
    const sourceCourse = await prisma.course.findUnique({
      where: { id: sourceCourseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        tags: true,
      },
    })

    if (!sourceCourse) {
      return NextResponse.json({ error: '원본 강의를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 라이브 온라인 강의만 녹화 강의로 변환 가능
    if (sourceCourse.courseType !== 'LIVE_ONLINE' && sourceCourse.courseType !== 'ONLINE') {
      return NextResponse.json(
        { error: '라이브 온라인 강의만 녹화 강의로 변환할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 녹화 강의 생성
    const recordedCourse = await prisma.course.create({
      data: {
        title: title || `${sourceCourse.title} (녹화)`,
        subtitle: sourceCourse.subtitle,
        description: description || sourceCourse.description,
        price: price || sourceCourse.price,
        thumbnail: sourceCourse.thumbnail,
        category: sourceCourse.category,
        level: sourceCourse.level,
        instructor: sourceCourse.instructor,
        courseType: 'RECORDED',
        isPublished: false,
        targetAudience: sourceCourse.targetAudience,
        benefits: sourceCourse.benefits,
        sourceCourseId: sourceCourseId,
        // 원본 강의의 레슨 구조 복사 (녹화본 연결 없이)
        lessons: {
          create: sourceCourse.lessons.map((lesson) => ({
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            order: lesson.order,
          })),
        },
        // 태그 복사
        tags: {
          create: sourceCourse.tags.map((tag) => ({
            tagId: tag.tagId,
          })),
        },
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        sourceCourse: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: '녹화 강의가 생성되었습니다.',
      course: recordedCourse,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create recorded course:', error)
    return NextResponse.json(
      { error: '녹화 강의 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
