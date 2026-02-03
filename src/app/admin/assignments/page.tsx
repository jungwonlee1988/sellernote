'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, FileText, Trash2, Edit, Eye, EyeOff } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  dueDate: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  maxScore: number
  course: {
    id: string
    title: string
  }
  _count: {
    submissions: number
  }
}

export default function AdminAssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

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

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'

    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-red-100 text-red-700',
    }
    const labels = {
      DRAFT: '초안',
      PUBLISHED: '공개',
      CLOSED: '마감',
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
          <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
          <p className="text-gray-600 mt-1">과제를 생성하고 채점합니다</p>
        </div>
        <Link
          href="/admin/assignments/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 과제 생성
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">등록된 과제가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  과제
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  강의
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  마감일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  제출
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
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-500">배점: {a.maxScore}점</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {a.course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {a.dueDate
                      ? format(new Date(a.dueDate), 'M월 d일 HH:mm', { locale: ko })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {a._count.submissions}건
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(a.id, a.status)}
                        className={`p-2 rounded-lg ${
                          a.status === 'PUBLISHED'
                            ? 'text-gray-400 hover:bg-gray-100'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={a.status === 'PUBLISHED' ? '비공개' : '공개'}
                      >
                        {a.status === 'PUBLISHED' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/assignments/${a.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
