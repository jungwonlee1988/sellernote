'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Award,
  Download,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { jsPDF } from 'jspdf'

interface Enrollment {
  id: string
  enrolledAt: string
  completedAt: string | null
  course: {
    id: string
    title: string
    thumbnail: string | null
    category: string
    level: string
    instructor: string
    startDate: string | null
    endDate: string | null
    _count: {
      lessons: number
    }
  }
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await fetch('/api/user/enrollments')
        if (response.ok) {
          const data = await response.json()
          setEnrollments(data)
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchEnrollments()
    }
  }, [session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const generateCertificate = async (enrollment: Enrollment) => {
    setIsGenerating(true)

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // 배경 테두리
      doc.setDrawColor(41, 98, 255)
      doc.setLineWidth(3)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      // 내부 테두리
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

      // 상단 장식선
      doc.setDrawColor(41, 98, 255)
      doc.setLineWidth(1)
      doc.line(pageWidth / 2 - 40, 35, pageWidth / 2 + 40, 35)

      // 제목: 수료증
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(42)
      doc.setTextColor(41, 98, 255)
      doc.text('CERTIFICATE', pageWidth / 2, 55, { align: 'center' })

      doc.setFontSize(18)
      doc.setTextColor(100, 100, 100)
      doc.text('of Completion', pageWidth / 2, 65, { align: 'center' })

      // 하단 장식선
      doc.setDrawColor(41, 98, 255)
      doc.line(pageWidth / 2 - 40, 72, pageWidth / 2 + 40, 72)

      // 수강생 이름
      doc.setFontSize(14)
      doc.setTextColor(80, 80, 80)
      doc.text('This is to certify that', pageWidth / 2, 90, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.setTextColor(40, 40, 40)
      doc.text(session?.user?.name || '', pageWidth / 2, 105, { align: 'center' })

      // 수료 내용
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      doc.setTextColor(80, 80, 80)
      doc.text('has successfully completed the course', pageWidth / 2, 120, { align: 'center' })

      // 강의명
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(41, 98, 255)

      // 긴 강의명 처리
      const courseTitle = enrollment.course.title
      if (courseTitle.length > 40) {
        doc.setFontSize(18)
      }
      doc.text(courseTitle, pageWidth / 2, 138, { align: 'center' })

      // 수료 증빙 문구
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(100, 100, 100)
      const certText = `This certificate verifies that the above-named individual has completed "${courseTitle}" course provided by SellerNote Inc.`
      const splitText = doc.splitTextToSize(certText, pageWidth - 80)
      doc.text(splitText, pageWidth / 2, 155, { align: 'center' })

      // 날짜 정보
      const enrollDate = formatDate(enrollment.enrolledAt)
      const completeDate = enrollment.completedAt
        ? formatDate(enrollment.completedAt)
        : formatDate(new Date().toISOString())

      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text(`Enrollment Date: ${enrollDate}`, pageWidth / 2 - 50, 178)
      doc.text(`Completion Date: ${completeDate}`, pageWidth / 2 + 50, 178, { align: 'right' })

      // 발급 기관
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('SellerNote Inc.', pageWidth / 2, 195, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('Import/Export Trade Education Platform', pageWidth / 2, 202, { align: 'center' })

      // 인증 번호
      const certNumber = `CERT-${enrollment.id.slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Certificate No: ${certNumber}`, pageWidth / 2, pageHeight - 18, { align: 'center' })

      // 발급일
      const issueDate = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      doc.text(`Issue Date: ${issueDate}`, pageWidth / 2, pageHeight - 13, { align: 'center' })

      // PDF 다운로드
      const fileName = `certificate_${enrollment.course.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${session?.user?.name}.pdf`
      doc.save(fileName)

      // 수료 완료 처리 (completedAt이 없는 경우)
      if (!enrollment.completedAt) {
        await fetch(`/api/user/enrollments/${enrollment.id}/complete`, {
          method: 'POST',
        })

        // 목록 새로고침
        const response = await fetch('/api/user/enrollments')
        if (response.ok) {
          const data = await response.json()
          setEnrollments(data)
        }
      }

      setSelectedEnrollment(null)
    } catch (error) {
      console.error('Certificate generation error:', error)
      alert('수료증 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6AAF50]"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/mypage"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          마이페이지로
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">내 강의</h1>
          <p className="text-gray-500">수강 중인 강의를 확인하고 수료증을 발급받을 수 있습니다.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">수강 중인 강의가 없습니다</h3>
            <p className="text-gray-500 mb-6">새로운 강의를 둘러보세요!</p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44]"
            >
              강의 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                onClick={() => setSelectedEnrollment(enrollment)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {enrollment.course.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                          <span className="px-2 py-0.5 bg-[#E8F5E3] text-[#5A9A44] rounded">
                            {enrollment.course.category}
                          </span>
                          <span>{enrollment.course.level}</span>
                          <span>{enrollment.course.instructor}</span>
                        </div>
                      </div>

                      {enrollment.completedAt ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          수료 완료
                        </span>
                      ) : (
                        <span className="text-[#6AAF50] text-sm font-medium">
                          수강 중
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        수강 시작: {formatDate(enrollment.enrolledAt)}
                      </span>
                      {enrollment.course.startDate && enrollment.course.endDate && (
                        <span>
                          교육 기간: {formatDate(enrollment.course.startDate)} ~ {formatDate(enrollment.course.endDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Award className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 수료증 발급 모달 */}
        {selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">수료증 발급</h2>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedEnrollment.course.title}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>수강생: {session.user.name}</p>
                  <p>수강 시작일: {formatDate(selectedEnrollment.enrolledAt)}</p>
                  {selectedEnrollment.completedAt && (
                    <p>수료일: {formatDate(selectedEnrollment.completedAt)}</p>
                  )}
                  <p>발급 기관: 주식회사 셀러노트</p>
                </div>
              </div>

              <div className="bg-[#F5FAF3] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#4A8A34]">
                  수료증에는 다음 내용이 기재됩니다:
                </p>
                <ul className="text-sm text-[#5A9A44] mt-2 space-y-1 list-disc list-inside">
                  <li>수강한 강의명</li>
                  <li>수강 시작일 및 수료일</li>
                  <li>주식회사 셀러노트로부터 발급된 공식 수료증</li>
                  <li>본 수강생이 해당 강의를 수강완료했음을 증빙</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => generateCertificate(selectedEnrollment)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-3 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      수료증 발급하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
