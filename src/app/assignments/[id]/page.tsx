'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, isPast } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useDropzone } from 'react-dropzone'
import {
  ArrowLeft,
  Clock,
  FileText,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface AssignmentDetail {
  id: string
  title: string
  description: string
  instructions: string | null
  dueDate: string | null
  maxScore: number
  passingScore: number
  allowLateSubmission: boolean
  latePenaltyPercent: number
  attachments: string[]
  status: string
  course: {
    id: string
    title: string
  }
  mySubmission?: {
    id: string
    content: string | null
    attachments: string[]
    status: 'SUBMITTED' | 'GRADED' | 'RETURNED'
    score: number | null
    feedback: string | null
    submittedAt: string
    isLate: boolean
    gradedAt: string | null
  } | null
}

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchAssignment()
  }, [id])

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${id}`)
      if (res.ok) {
        const data = await res.json()
        setAssignment(data)
        if (data.mySubmission?.content) {
          setContent(data.mySubmission.content)
        }
      } else {
        router.push('/assignments')
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles])
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      alert('내용 또는 파일을 추가해주세요.')
      return
    }

    setSubmitting(true)
    try {
      // 파일 업로드 (실제 구현에서는 Supabase Storage 사용)
      const uploadedUrls: string[] = []
      // TODO: 파일 업로드 구현

      const res = await fetch(`/api/assignments/${id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachments: uploadedUrls,
        }),
      })

      if (res.ok) {
        alert('과제가 제출되었습니다.')
        fetchAssignment()
      } else {
        const error = await res.json()
        alert(error.error || '제출에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!assignment) {
    return null
  }

  const isOverdue = assignment.dueDate && isPast(new Date(assignment.dueDate))
  const canSubmit =
    !assignment.mySubmission ||
    assignment.mySubmission.status === 'RETURNED' ||
    (isOverdue && assignment.allowLateSubmission)
  const isGraded = assignment.mySubmission?.status === 'GRADED'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/assignments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="text-sm text-blue-600 font-medium mb-2">
            {assignment.course.title}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {assignment.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  마감:{' '}
                  {format(new Date(assignment.dueDate), 'yyyy년 M월 d일 HH:mm', {
                    locale: ko,
                  })}
                </span>
                {isOverdue && (
                  <span className="text-red-600 font-medium">(마감됨)</span>
                )}
              </div>
            )}
            <span>배점: {assignment.maxScore}점</span>
            <span>합격 기준: {assignment.passingScore}점</span>
            {assignment.allowLateSubmission && (
              <span className="text-orange-600">
                지각 제출 가능 (-{assignment.latePenaltyPercent}%)
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">과제 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>

          {assignment.instructions && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">제출 안내</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          )}

          {assignment.attachments.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">첨부 자료</h2>
              <div className="space-y-2">
                {assignment.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    첨부파일 {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 제출 상태 / 채점 결과 */}
        {assignment.mySubmission && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">내 제출</h2>

            {isGraded && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  assignment.mySubmission.score! >= assignment.passingScore
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {assignment.mySubmission.score! >= assignment.passingScore ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold text-lg">
                    {assignment.mySubmission.score}점 / {assignment.maxScore}점
                  </span>
                  {assignment.mySubmission.isLate && (
                    <span className="text-sm text-orange-600">
                      (지각 감점 적용)
                    </span>
                  )}
                </div>
                {assignment.mySubmission.feedback && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">강사 피드백:</div>
                    <p className="text-gray-800">
                      {assignment.mySubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {assignment.mySubmission.status === 'SUBMITTED' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>채점 대기 중입니다.</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  제출일:{' '}
                  {format(
                    new Date(assignment.mySubmission.submittedAt),
                    'yyyy년 M월 d일 HH:mm',
                    { locale: ko }
                  )}
                </p>
              </div>
            )}

            {assignment.mySubmission.status === 'RETURNED' && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>재제출이 필요합니다.</span>
                </div>
                {assignment.mySubmission.feedback && (
                  <p className="text-gray-700 mt-2">
                    {assignment.mySubmission.feedback}
                  </p>
                )}
              </div>
            )}

            {assignment.mySubmission.content && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">제출 내용:</div>
                <p className="text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border">
                  {assignment.mySubmission.content}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 제출 폼 */}
        {canSubmit && !isGraded && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">
              {assignment.mySubmission ? '재제출' : '과제 제출'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="과제 내용을 작성해주세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파일 첨부
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-sm text-gray-500 mt-1">최대 10MB</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '제출 중...' : '제출하기'}
              </button>

              {isOverdue && assignment.allowLateSubmission && (
                <p className="text-sm text-orange-600 text-center">
                  지각 제출 시 {assignment.latePenaltyPercent}% 감점이 적용됩니다.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
