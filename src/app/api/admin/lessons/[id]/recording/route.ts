import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PATCH: 레슨에 녹화본 연결/변경 (TODO: 스키마 업데이트 필요)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: lessonId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { recordingId } = await request.json()

    // 레슨 존재 확인
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: '레슨을 찾을 수 없습니다.' }, { status: 404 })
    }

    // recordingId가 제공된 경우 녹화본 존재 확인
    if (recordingId) {
      const recording = await prisma.sessionRecording.findUnique({
        where: { id: recordingId },
      })

      if (!recording) {
        return NextResponse.json({ error: '녹화본을 찾을 수 없습니다.' }, { status: 404 })
      }
    }

    // 레슨의 videoUrl 필드를 활용하여 녹화본 URL 저장
    const recording = recordingId ? await prisma.sessionRecording.findUnique({
      where: { id: recordingId },
    }) : null

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoUrl: recording?.fileUrl || null,
      },
    })

    return NextResponse.json(updatedLesson)
  } catch (error) {
    console.error('Failed to link recording:', error)
    return NextResponse.json(
      { error: '녹화본 연결에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 레슨에서 녹화본 연결 해제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: lessonId } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoUrl: null,
      },
    })

    return NextResponse.json(updatedLesson)
  } catch (error) {
    console.error('Failed to unlink recording:', error)
    return NextResponse.json(
      { error: '녹화본 연결 해제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
