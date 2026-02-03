'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FileText, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string | null
  maxScore: number
  passingScore: number
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  course: {
    id: string
    title: string
  }
  mySubmission?: {
    id: string
    status: 'SUBMITTED' | 'GRADED' | 'RETURNED'
    score: number | null
    submittedAt: string
    isLate: boolean
  } | null
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return !a.mySubmission
    if (filter === 'submitted') return a.mySubmission?.status === 'SUBMITTED'
    if (filter === 'graded') return a.mySubmission?.status === 'GRADED'
    return true
  })

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.mySubmission) {
      if (assignment.dueDate && isPast(new Date(assignment.dueDate))) {
        return (
          <span className="flex items-center gap-1 text-red-600 text-sm">
            <XCircle className="w-4 h-4" />
            마감됨
          </span>
        )
      }
      return (
        <span className="flex items-center gap-1 text-orange-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          미제출
        </span>
      )
    }

    if (assignment.mySubmission.status === 'SUBMITTED') {
      return (
        <span className="flex items-center gap-1 text-blue-600 text-sm">
          <Clock className="w-4 h-4" />
          채점 대기
        </span>
      )
    }

    if (assignment.mySubmission.status === 'GRADED') {
      const passed =
        assignment.mySubmission.score !== null &&
        assignment.mySubmission.score >= assignment.passingScore
      return (
        <span
          className={`flex items-center gap-1 text-sm ${
            passed ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {assignment.mySubmission.score}점 {passed ? '(통과)' : '(미달)'}
        </span>
      )
    }

    if (assignment.mySubmission.status === 'RETURNED') {
      return (
        <span className="flex items-center gap-1 text-orange-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          재제출 필요
        </span>
      )
    }

    return null
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
        <h1 className="text-2xl font-bold text-gray-900">과제</h1>
        <p className="text-gray-600 mt-1">수강 중인 강의의 과제를 확인하고 제출하세요</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all'
              ? '전체'
              : f === 'pending'
              ? '미제출'
              : f === 'submitted'
              ? '채점 대기'
              : '채점 완료'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">과제가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/assignments/${assignment.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {assignment.course.title}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assignment.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {assignment.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          마감:{' '}
                          {format(new Date(assignment.dueDate), 'M월 d일 HH:mm', {
                            locale: ko,
                          })}
                          {!isPast(new Date(assignment.dueDate)) && (
                            <span className="text-orange-600 ml-1">
                              ({formatDistanceToNow(new Date(assignment.dueDate), {
                                locale: ko,
                                addSuffix: true,
                              })})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <span>배점: {assignment.maxScore}점</span>
                  </div>
                </div>

                <div className="ml-4">{getStatusBadge(assignment)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
