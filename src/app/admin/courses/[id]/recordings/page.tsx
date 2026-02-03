'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  ArrowLeft,
  Video,
  PlayCircle,
  Check,
  X,
  Loader2,
  Link as LinkIcon,
  Unlink,
  Clock,
  Calendar,
} from 'lucide-react'

interface Recording {
  id: string
  title: string | null
  fileUrl: string | null
  duration: number | null
  createdAt: string
  session: {
    id: string
    title: string
    scheduledAt: string
  }
}

interface Lesson {
  id: string
  title: string
  order: number
  duration: number | null
  recording: Recording | null
}

interface Course {
  id: string
  title: string
  courseType: string
  sourceCourseId: string | null
  sourceCourse: { id: string; title: string } | null
  lessons: Lesson[]
}

export default function CourseRecordingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [linkingLessonId, setLinkingLessonId] = useState<string | null>(null)
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null)

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
      const res = await fetch(`/api/admin/courses/${courseId}/recordings`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data.course)
        setRecordings(data.recordings)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkRecording = async (lessonId: string, recordingId: string | null) => {
    setSavingLessonId(lessonId)
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/recording`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId }),
      })

      if (res.ok) {
        fetchData()
        setLinkingLessonId(null)
        setSelectedRecordingId(null)
      } else {
        const error = await res.json()
        alert(error.error || '녹화본 연결에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to link recording:', error)
      alert('녹화본 연결에 실패했습니다.')
    } finally {
      setSavingLessonId(null)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <p className="text-gray-600">강의를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const linkedCount = course.lessons.filter((l) => l.recording).length
  const totalLessons = course.lessons.length

  return (
    <div className="p-6">
      <Link
        href={`/admin/courses/${courseId}`}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>강의 상세로</span>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            course.courseType === 'RECORDED'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {course.courseType === 'RECORDED' ? '녹화 강의' : '라이브 온라인'}
          </span>
        </div>
        <p className="text-gray-600">레슨에 녹화본을 연결하여 녹화 강의를 구성합니다.</p>
        {course.sourceCourse && (
          <p className="text-sm text-gray-500 mt-1">
            원본 강의: <span className="font-medium">{course.sourceCourse.title}</span>
          </p>
        )}
      </div>

      {/* 진행 상황 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">녹화본 연결 현황</h2>
          <span className={`text-lg font-bold ${
            linkedCount === totalLessons ? 'text-green-600' : 'text-amber-600'
          }`}>
            {linkedCount} / {totalLessons}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              linkedCount === totalLessons ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${(linkedCount / totalLessons) * 100}%` }}
          />
        </div>
        {linkedCount === totalLessons && (
          <p className="mt-3 text-green-600 text-sm font-medium">
            모든 레슨에 녹화본이 연결되었습니다. 강의를 게시할 수 있습니다.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 레슨 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
              커리큘럼 ({totalLessons}개)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-4 ${
                  linkingLessonId === lesson.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      lesson.recording
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lesson.recording ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        lesson.order
                      )}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      {lesson.recording ? (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          {lesson.recording.session.title}
                          <span className="text-gray-400 ml-2">
                            ({formatDuration(lesson.recording.duration)})
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">녹화본 미연결</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.recording && (
                      <button
                        onClick={() => handleLinkRecording(lesson.id, null)}
                        disabled={savingLessonId === lesson.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="연결 해제"
                      >
                        {savingLessonId === lesson.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unlink className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setLinkingLessonId(lesson.id)
                        setSelectedRecordingId(lesson.recording?.id || null)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        linkingLessonId === lesson.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      {lesson.recording ? '변경' : '연결'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 녹화본 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              녹화본 목록 ({recordings.length}개)
            </h2>
          </div>
          {recordings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>사용 가능한 녹화본이 없습니다.</p>
              <p className="text-sm mt-1">라이브 온라인 수업을 진행하면 녹화본이 생성됩니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {recordings.map((recording) => {
                const isLinked = course.lessons.some(
                  (l) => l.recording?.id === recording.id
                )
                const isSelected = selectedRecordingId === recording.id

                return (
                  <div
                    key={recording.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : isLinked
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (linkingLessonId) {
                        setSelectedRecordingId(recording.id)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {recording.session.title}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(recording.session.scheduledAt), 'M월 d일', {
                              locale: ko,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(recording.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLinked && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            사용중
                          </span>
                        )}
                        {isSelected && linkingLessonId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLinkRecording(linkingLessonId, recording.id)
                            }}
                            disabled={savingLessonId === linkingLessonId}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            {savingLessonId === linkingLessonId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              '연결하기'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 선택 취소 버튼 */}
      {linkingLessonId && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => {
              setLinkingLessonId(null)
              setSelectedRecordingId(null)
            }}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            선택 취소
          </button>
        </div>
      )}
    </div>
  )
}
