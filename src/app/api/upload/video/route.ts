import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 또는 강사만 비디오 업로드 가능
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'MP4, WebM, MOV, AVI 비디오만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 500MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 파일 이름 생성
    const timestamp = Date.now()
    const ext = path.extname(file.name) || '.mp4'
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_').slice(0, 50)
    const fileName = `${timestamp}-${sanitizedName}`

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // 접근 URL 반환
    const url = `/uploads/videos/${fileName}`

    return NextResponse.json({
      message: '비디오가 업로드되었습니다.',
      url,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: '비디오 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
