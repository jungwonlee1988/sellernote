'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReactPlayer from 'react-player'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, Clock, User } from 'lucide-react'

interface RecordingDetail {
  id: string
  title: string | null
  duration: number | null
  createdAt: string
  streamUrl: string
  session: {
    id: string
    title: string
    course: {
      id: string
      title: string
    }
    instructor: {
      id: string
      name: string
    }
  }
  viewProgress: {
    lastPosition: number
    watchTime: number
    completed: boolean
  }
}

export default function RecordingPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const playerRef = useRef<ReactPlayer>(null)
  const [recording, setRecording] = useState<RecordingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastSavedPosition = useRef(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchRecording()
  }, [id])

  const fetchRecording = async () => {
    try {
      const res = await fetch(`/api/recordings/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRecording(data)
        if (data.viewProgress?.lastPosition) {
          setProgress(data.viewProgress.lastPosition)
        }
      } else {
        router.push('/recordings')
      }
    } catch (error) {
      console.error('Failed to fetch recording:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (currentPosition: number, watchTime: number) => {
    if (Math.abs(currentPosition - lastSavedPosition.current) < 10) return

    try {
      await fetch(`/api/recordings/${id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastPosition: Math.floor(currentPosition),
          watchTime: Math.floor(watchTime),
        }),
      })
      lastSavedPosition.current = currentPosition
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleProgress = (state: { playedSeconds: number }) => {
    setProgress(state.playedSeconds)
    saveProgress(state.playedSeconds, 10)
  }

  const handleReady = () => {
    if (recording?.viewProgress?.lastPosition && playerRef.current) {
      playerRef.current.seekTo(recording.viewProgress.lastPosition, 'seconds')
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!recording) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="p-4">
          <button
            onClick={() => router.push('/recordings')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>목록으로</span>
          </button>
        </div>

        <div className="aspect-video bg-black">
          <ReactPlayer
            ref={playerRef}
            url={recording.streamUrl}
            width="100%"
            height="100%"
            playing={playing}
            controls={true}
            onReady={handleReady}
            onProgress={handleProgress}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => saveProgress(recording.duration || progress, 0)}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        </div>

        <div className="p-6 text-white">
          <div className="text-sm text-blue-400 mb-2">
            {recording.session.course.title}
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {recording.title || recording.session.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{recording.session.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(recording.duration)}</span>
            </div>
            <span>
              {format(new Date(recording.createdAt), 'yyyy년 M월 d일', {
                locale: ko,
              })}
            </span>
          </div>

          {recording.duration && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>시청 진행도</span>
                <span>
                  {formatDuration(progress)} / {formatDuration(recording.duration)}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${(progress / recording.duration) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
