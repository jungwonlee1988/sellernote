'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Video, Calendar, Users, ArrowLeft, Play, Clock } from 'lucide-react'
import VideoRoom from '@/components/live/VideoRoom'

interface LiveSessionDetail {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  startedAt: string | null
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  maxParticipants: number
  course: {
    id: string
    title: string
    thumbnail: string | null
    instructor: string
  }
  instructor: {
    id: string
    name: string
    profileImage: string | null
  }
  _count: {
    participants: number
    chatMessages: number
    questions: number
  }
}

export default function LiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [liveSession, setLiveSession] = useState<LiveSessionDetail | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [inRoom, setInRoom] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setLiveSession(data)
      } else {
        router.push('/live')
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinSession = async () => {
    setJoining(true)
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setToken(data.token)
        setWsUrl(data.wsUrl)
        setIsHost(data.isHost)
        setInRoom(true)
      } else {
        const error = await res.json()
        alert(error.error || '참여에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      alert('참여에 실패했습니다.')
    } finally {
      setJoining(false)
    }
  }

  const startSession = async () => {
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/start`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchSession()
        joinSession()
      } else {
        const error = await res.json()
        alert(error.error || '수업 시작에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleLeave = () => {
    setInRoom(false)
    setToken(null)
    router.push('/live')
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!liveSession) {
    return null
  }

  if (inRoom && token && wsUrl) {
    return (
      <VideoRoom
        sessionId={sessionId}
        token={token}
        wsUrl={wsUrl}
        isHost={isHost}
        onLeave={handleLeave}
      />
    )
  }

  const isInstructor = liveSession.instructor.id === session?.user?.id
  const isAdmin = session?.user?.role === 'ADMIN'
  const canStart = (isInstructor || isAdmin) && liveSession.status === 'SCHEDULED'
  const canJoin = liveSession.status === 'LIVE'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/live')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative h-64 bg-gray-100">
          {liveSession.course.thumbnail ? (
            <img
              src={liveSession.course.thumbnail}
              alt={liveSession.course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-sm opacity-80 mb-1">{liveSession.course.title}</div>
            <h1 className="text-2xl font-bold">{liveSession.title}</h1>
          </div>
          {liveSession.status === 'LIVE' && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              실시간 진행 중
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">일시</div>
                <div className="font-medium">
                  {format(new Date(liveSession.scheduledAt), 'M월 d일 (EEE) HH:mm', {
                    locale: ko,
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">참가자</div>
                <div className="font-medium">
                  {liveSession._count.participants} / {liveSession.maxParticipants}명
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {liveSession.instructor.profileImage ? (
                  <img
                    src={liveSession.instructor.profileImage}
                    alt={liveSession.instructor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {liveSession.instructor.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500">강사</div>
                <div className="font-medium">{liveSession.instructor.name}</div>
              </div>
            </div>
          </div>

          {liveSession.description && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">수업 소개</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {liveSession.description}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {canStart && (
              <button
                onClick={startSession}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                수업 시작하기
              </button>
            )}
            {canJoin && (
              <button
                onClick={joinSession}
                disabled={joining}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Video className="w-5 h-5" />
                {joining ? '참여 중...' : '수업 참여하기'}
              </button>
            )}
            {liveSession.status === 'SCHEDULED' && !canStart && (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-lg">
                <Clock className="w-5 h-5" />
                수업 시작 대기 중
              </div>
            )}
            {liveSession.status === 'ENDED' && (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-lg">
                종료된 수업입니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
