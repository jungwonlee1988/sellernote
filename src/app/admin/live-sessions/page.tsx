'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, Video, Calendar, Users, Trash2, Edit, Play, Square } from 'lucide-react'

interface LiveSession {
  id: string
  title: string
  scheduledAt: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  course: {
    id: string
    title: string
  }
  instructor: {
    id: string
    name: string
  }
  _count: {
    participants: number
  }
}

export default function AdminLiveSessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/live-sessions')
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

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/live-sessions/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleStart = async (id: string) => {
    try {
      const res = await fetch(`/api/live-sessions/${id}/start`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchSessions()
      } else {
        const error = await res.json()
        alert(error.error || '수업 시작에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to start:', error)
    }
  }

  const handleEnd = async (id: string) => {
    if (!confirm('수업을 종료하시겠습니까?')) return

    try {
      const res = await fetch(`/api/live-sessions/${id}/end`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchSessions()
      } else {
        const error = await res.json()
        alert(error.error || '수업 종료에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to end:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      LIVE: 'bg-red-100 text-red-700',
      ENDED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-yellow-100 text-yellow-700',
    }
    const labels = {
      SCHEDULED: '예정됨',
      LIVE: '진행 중',
      ENDED: '종료',
      CANCELLED: '취소됨',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">화상 수업 관리</h1>
          <p className="text-gray-600 mt-1">화상 수업을 생성하고 관리합니다</p>
        </div>
        <Link
          href="/admin/live-sessions/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 수업 생성
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">등록된 화상 수업이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  수업
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  강의
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  참가자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-500">{s.instructor.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {s.course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(s.scheduledAt), 'M월 d일 HH:mm', {
                      locale: ko,
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {s._count.participants}명
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStart(s.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="시작"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {s.status === 'LIVE' && (
                        <button
                          onClick={() => handleEnd(s.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="종료"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      {s.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
