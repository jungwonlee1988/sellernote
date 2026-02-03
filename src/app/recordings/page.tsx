'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Video, Play, Clock, CheckCircle } from 'lucide-react'

interface Recording {
  id: string
  title: string | null
  duration: number | null
  createdAt: string
  status: string
  session: {
    id: string
    title: string
    course: {
      id: string
      title: string
      thumbnail: string | null
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
  } | null
}

export default function RecordingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/recordings')
      if (res.ok) {
        const data = await res.json()
        setRecordings(data)
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">녹화 다시보기</h1>
        <p className="text-gray-600 mt-1">지난 화상 수업을 다시 시청하세요</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">아직 녹화된 수업이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recordings.map((recording) => (
            <Link
              key={recording.id}
              href={`/recordings/${recording.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-40 bg-gray-100">
                {recording.session.course.thumbnail ? (
                  <img
                    src={recording.session.course.thumbnail}
                    alt={recording.session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                {recording.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatDuration(recording.duration)}
                  </div>
                )}
                {recording.viewProgress?.completed && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {recording.session.course.title}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {recording.title || recording.session.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{recording.session.instructor.name}</span>
                  <span>
                    {format(new Date(recording.createdAt), 'M월 d일', {
                      locale: ko,
                    })}
                  </span>
                </div>

                {recording.viewProgress && !recording.viewProgress.completed && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>시청 중</span>
                      <span>
                        {formatDuration(recording.viewProgress.lastPosition)} /{' '}
                        {formatDuration(recording.duration)}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${
                            recording.duration
                              ? (recording.viewProgress.lastPosition /
                                  recording.duration) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
