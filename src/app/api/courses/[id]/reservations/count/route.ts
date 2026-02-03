import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 예약 대기 인원 수 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params

    const count = await prisma.courseReservation.count({
      where: {
        courseId,
        status: 'WAITING',
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to fetch reservation count:', error)
    return NextResponse.json({ count: 0 })
  }
}
