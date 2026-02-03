import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedUrl, RECORDING_BUCKET } from '@/lib/supabase-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const recording = await prisma.sessionRecording.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            course: {
              select: { id: true, title: true },
            },
            instructor: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!recording) {
      return NextResponse.json(
        { error: '녹화를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (recording.status !== 'READY') {
      return NextResponse.json(
        { error: '녹화가 아직 처리 중입니다.' },
        { status: 400 }
      )
    }

    // 수강 중인지 확인 (일반 사용자)
    if (session.user.role === 'USER') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: recording.session.courseId,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: '해당 강의를 수강 중이 아닙니다.' },
          { status: 403 }
        )
      }
    }

    // Signed URL 생성 (1시간 유효)
    let streamUrl = recording.fileUrl
    if (recording.storageType === 'SUPABASE' && recording.storagePath) {
      try {
        streamUrl = await getSignedUrl(RECORDING_BUCKET, recording.storagePath, 3600)
      } catch (error) {
        console.error('Failed to generate signed URL:', error)
      }
    }

    // 시청 기록 조회/생성
    const viewLog = await prisma.recordingViewLog.upsert({
      where: {
        recordingId_userId: {
          recordingId: id,
          userId: session.user.id,
        },
      },
      update: {
        watchedAt: new Date(),
      },
      create: {
        recordingId: id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      ...recording,
      streamUrl,
      viewProgress: {
        lastPosition: viewLog.lastPosition,
        watchTime: viewLog.watchTime,
        completed: viewLog.completed,
      },
    })
  } catch (error) {
    console.error('Recording fetch error:', error)
    return NextResponse.json(
      { error: '녹화 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || !['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const recording = await prisma.sessionRecording.findUnique({
      where: { id },
      include: {
        session: true,
      },
    })

    if (!recording) {
      return NextResponse.json(
        { error: '녹화를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (
      recording.session.instructorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 실제 파일 삭제는 별도로 처리 (스토리지 정책에 따라)
    await prisma.sessionRecording.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    return NextResponse.json({ message: '녹화가 삭제되었습니다.' })
  } catch (error) {
    console.error('Recording delete error:', error)
    return NextResponse.json(
      { error: '녹화 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
