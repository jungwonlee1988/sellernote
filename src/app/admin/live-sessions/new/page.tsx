'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Course {
  id: string
  title: string
  lessons: { id: string; title: string }[]
}

export default function NewLiveSessionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    courseId: '',
    lessonId: '',
    title: '',
    description: '',
    scheduledAt: '',
    maxParticipants: 100,
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
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
          ...formData,
          lessonId: formData.lessonId || undefined,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        }),
      })

      if (res.ok) {
        router.push('/admin/live-sessions')
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

  const selectedCourse = courses.find((c) => c.id === formData.courseId)

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/admin/live-sessions')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로</span>
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">새 화상 수업 생성</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              강의 선택 *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value, lessonId: '' })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">강의를 선택하세요</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && selectedCourse.lessons?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                관련 레슨 (선택)
              </label>
              <select
                value={formData.lessonId}
                onChange={(e) =>
                  setFormData({ ...formData, lessonId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">없음</option>
                {selectedCourse.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수업 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 1주차 - 무역 기초 이론"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수업 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="수업에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수업 일시 *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({ ...formData, scheduledAt: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxParticipants: parseInt(e.target.value) || 100,
                })
              }
              min={1}
              max={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/live-sessions')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '생성 중...' : '수업 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
