import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')

    // 검색어가 있는 경우 Full-Text Search
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).join(' & ')
      const searchPattern = `%${search}%`
      const offset = (page - 1) * limit

      // 필터 조건 생성
      const categoryFilter = category ? Prisma.sql`AND c.category = ${category}` : Prisma.sql``
      const levelFilter = level ? Prisma.sql`AND c.level = ${level}` : Prisma.sql``

      try {
        // Full-Text Search 쿼리 (레슨 포함)
        const courses = await prisma.$queryRaw<Array<{
          id: string
          title: string
          description: string
          price: number
          thumbnail: string | null
          category: string
          level: string
          instructor: string
          isPublished: boolean
          startDate: Date | null
          endDate: Date | null
          createdAt: Date
          updatedAt: Date
          rank: number
          enrollment_count: bigint
        }>>`
          SELECT
            c.id, c.title, c.description, c.price, c.thumbnail,
            c.category, c.level, c.instructor, c."isPublished",
            c."startDate", c."endDate", c."createdAt", c."updatedAt",
            (
              CASE WHEN c.title ILIKE ${searchPattern} THEN 100 ELSE 0 END +
              CASE WHEN c.category ILIKE ${searchPattern} THEN 50 ELSE 0 END +
              CASE WHEN EXISTS (
                SELECT 1 FROM "Lesson" l
                WHERE l."courseId" = c.id
                AND (l.title ILIKE ${searchPattern} OR l.content ILIKE ${searchPattern})
              ) THEN 30 ELSE 0 END +
              CASE WHEN c.description ILIKE ${searchPattern} THEN 20 ELSE 0 END +
              CASE WHEN c.instructor ILIKE ${searchPattern} THEN 10 ELSE 0 END
            ) as rank,
            COUNT(e.id) as enrollment_count
          FROM "Course" c
          LEFT JOIN "Enrollment" e ON c.id = e."courseId"
          WHERE c."isPublished" = true
            AND (
              c.title ILIKE ${searchPattern}
              OR c.description ILIKE ${searchPattern}
              OR c.instructor ILIKE ${searchPattern}
              OR EXISTS (
                SELECT 1 FROM "Lesson" l
                WHERE l."courseId" = c.id
                AND (l.title ILIKE ${searchPattern} OR l.content ILIKE ${searchPattern})
              )
            )
            ${categoryFilter}
            ${levelFilter}
          GROUP BY c.id
          ORDER BY rank DESC, c."createdAt" DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `

        // 총 개수 조회 (레슨 포함)
        const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM "Course" c
          WHERE c."isPublished" = true
            AND (
              c.title ILIKE ${searchPattern}
              OR c.description ILIKE ${searchPattern}
              OR c.instructor ILIKE ${searchPattern}
              OR EXISTS (
                SELECT 1 FROM "Lesson" l
                WHERE l."courseId" = c.id
                AND (l.title ILIKE ${searchPattern} OR l.content ILIKE ${searchPattern})
              )
            )
            ${categoryFilter}
            ${levelFilter}
        `

        const total = Number(countResult[0]?.count || 0)

        const formattedCourses = courses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          price: Number(course.price),
          thumbnail: course.thumbnail,
          category: course.category,
          level: course.level,
          instructor: course.instructor,
          isPublished: course.isPublished,
          startDate: course.startDate,
          endDate: course.endDate,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          _count: {
            enrollments: Number(course.enrollment_count)
          }
        }))

        return NextResponse.json({
          courses: formattedCourses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      } catch (searchError) {
        console.error('Search query error:', searchError)
        // 검색 쿼리 실패 시 에러 반환
        return NextResponse.json(
          { error: '검색 중 오류가 발생했습니다.', details: String(searchError) },
          { status: 500 }
        )
      }
    }

    // 검색어가 없는 경우 기본 쿼리
    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (category) {
      where.category = category
    }

    if (level) {
      where.level = level
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { error: '강의 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
