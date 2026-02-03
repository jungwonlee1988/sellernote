'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Video, Calendar, Users, Clock, Play } from 'lucide-react'

interface LiveSession {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  course: {
    id: string
    title: string
    thumbnail: string | null
  }
  instructor: {
    id: string
    name: string
    profileImage: string | null
  }
  _count: {
    participants: number
  }
}

export default function LiveSessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'ended'>('upcoming')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchSessions()
  }, [filter])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'upcoming') {
        params.set('upcoming', 'true')
      } else if (filter === 'live') {
        params.set('status', 'LIVE')
      } else {
        params.set('status', 'ENDED')
      }

      const res = await fetch(`/api/live-sessions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">화상 수업</h1>
          <p className="text-gray-600 mt-1">실시간 화상 강의에 참여하세요</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['upcoming', 'live', 'ended'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'upcoming' ? '예정된 수업' : f === 'live' ? '진행 중' : '종료된 수업'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'upcoming'
              ? '예정된 화상 수업이 없습니다.'
              : filter === 'live'
              ? '현재 진행 중인 수업이 없습니다.'
              : '종료된 수업이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: LiveSession }) {
  const isLive = session.status === 'LIVE'
  const isUpcoming = session.status === 'SCHEDULED'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-gray-100">
        {session.course.thumbnail ? (
          <img
            src={session.course.thumbnail}
            alt={session.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs text-blue-600 font-medium mb-1">
          {session.course.title}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {session.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(session.scheduledAt), 'M월 d일 (EEE) HH:mm', {
                locale: ko,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{session._count.participants}명 참여</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {session.instructor.profileImage ? (
                <img
                  src={session.instructor.profileImage}
                  alt={session.instructor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  {session.instructor.name?.[0]}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-700">{session.instructor.name}</span>
          </div>

          {(isLive || isUpcoming) && (
            <Link
              href={`/live/${session.id}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isLive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLive ? '참여하기' : '대기실'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
