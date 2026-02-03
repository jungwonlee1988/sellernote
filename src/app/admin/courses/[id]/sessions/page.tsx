'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  ArrowLeft,
  Plus,
  Video,
  Calendar,
  Users,
  Trash2,
  Play,
  Square,
  Loader2,
} from 'lucide-react'

interface LiveSession {
  id: string
  title: string
  scheduledAt: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  _count: {
    participants: number
    recordings: number
  }
}

interface Course {
  id: string
  title: string
  courseType: string
}

export default function CourseSessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  // 새 수업 생성 폼
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    maxParticipants: 100,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      // 강의 정보
      const courseRes = await fetch(`/api/admin/courses/${courseId}`)
      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData)
      }

      // 해당 강의의 화상 수업 목록
      const sessionsRes = await fetch(`/api/live-sessions?courseId=${courseId}`)
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: formData.title,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          maxParticipants: formData.maxParticipants,
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({ title: '', scheduledAt: '', maxParticipants: 100 })
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || '생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create:', error)
      alert('생성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/live-sessions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
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
      const res = await fetch(`/api/live-sessions/${id}/start`, { method: 'POST' })
      if (res.ok) {
        fetchData()
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
      const res = await fetch(`/api/live-sessions/${id}/end`, { method: 'POST' })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || '수업 종료에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to end:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      LIVE: 'bg-red-100 text-red-700 animate-pulse',
      ENDED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-yellow-100 text-yellow-700',
    }
    const labels: Record<string, string> = {
      SCHEDULED: '예정됨',
      LIVE: '진행 중',
      ENDED: '종료',
      CANCELLED: '취소됨',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isLiveOnline = course?.courseType === 'LIVE_ONLINE' || course?.courseType === 'ONLINE'

  return (
    <div className="p-6">
      <Link
        href="/admin/courses"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>강의 목록으로</span>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course?.title || '강의'} - 화상 수업
          </h1>
          <p className="text-gray-600 mt-1">이 강의의 화상 수업을 관리합니다</p>
        </div>
        {isLiveOnline && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            새 수업 추가
          </button>
        )}
      </div>

      {!isLiveOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800">
            화상 수업은 <strong>라이브 온라인</strong> 강의에서만 사용할 수 있습니다.
          </p>
        </div>
      )}

      {/* 새 수업 생성 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">새 화상 수업 추가</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수업 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="예: 1주차 - 기초 이론"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수업 일시 *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최대 참가자 수
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 100 })}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? '생성 중...' : '수업 추가'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 수업 목록 */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">등록된 화상 수업이 없습니다.</p>
          {isLiveOnline && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              첫 수업 추가하기
            </button>
          )}
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
                  일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  참가자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  녹화
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
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(s.scheduledAt), 'M월 d일 (E) HH:mm', { locale: ko })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {s._count.participants}명
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {s._count.recordings > 0 ? (
                      <span className="text-green-600">{s._count.recordings}개</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleStart(s.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="시작"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
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
