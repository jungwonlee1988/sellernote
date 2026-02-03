'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Clock,
  Users,
  PlayCircle,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Star,
  User,
  Pencil,
  Trash2,
  Calendar,
  CalendarDays,
  MapPin,
  Target,
  Award,
  AlertCircle,
  ExternalLink,
  Video,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: number | null
  order: number
}

interface CourseSchedule {
  id: string
  date: string
  title: string | null
}

interface CourseTag {
  id: string
  tag: {
    id: string
    name: string
    color: string
  }
}

interface Course {
  id: string
  title: string
  subtitle: string | null
  description: string
  price: number
  thumbnail: string | null
  category: string
  level: string
  instructor: string
  courseType: 'ONLINE' | 'OFFLINE' | 'LIVE_ONLINE' | 'LIVE_OFFLINE' | 'RECORDED'
  startDate: string | null
  endDate: string | null
  lessons: Lesson[]
  schedules?: CourseSchedule[]
  tags?: CourseTag[]
  _count: {
    enrollments: number
  }
  // 오프라인 교육 관련
  capacity: number | null
  earlyBirdPrice: number | null
  earlyBirdEndDate: string | null
  location: string | null
  locationAddress: string | null
  locationUrl: string | null
  educationTime: string | null
  targetAudience: string[]
  benefits: string[]
}

interface ReviewUser {
  id: string
  name: string
  profileImage: string | null
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: ReviewUser
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: { rating: number; count: number }[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showCurriculum, setShowCurriculum] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [reservationCount, setReservationCount] = useState(0)

  useEffect(() => {
    fetchCourse()
    fetchReviews()
    fetchReservationCount()
  }, [params.id])

  const fetchReservationCount = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/reservations/count`)
      if (response.ok) {
        const data = await response.json()
        setReservationCount(data.count)
      }
    } catch {
      console.error('Failed to fetch reservation count')
    }
  }

  const fetchCourse = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        setCourse(getSampleCourse(params.id as string))
      }
    } catch {
      setCourse(getSampleCourse(params.id as string))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setReviewStats(data.stats)

        // 내 수강평 찾기
        if (session?.user?.id) {
          const my = data.reviews.find((r: Review) => r.user.id === session.user.id)
          if (my) {
            setMyReview(my)
            setReviewRating(my.rating)
            setReviewContent(my.content)
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  useEffect(() => {
    if (session?.user?.id && reviews.length > 0) {
      const my = reviews.find((r) => r.user.id === session.user.id)
      if (my) {
        setMyReview(my)
        setReviewRating(my.rating)
        setReviewContent(my.content)
      }
    }
  }, [session, reviews])

  const getSampleCourse = (id: string): Course => {
    const sampleCourses: Record<string, Course> = {
      '1': {
        id: '1',
        title: '수입무역 입문 완성',
        subtitle: '수입무역의 A to Z, 하루 만에 끝내는 실무 입문 과정',
        description: `수입무역의 기초부터 실무까지 체계적으로 배우는 입문 과정입니다.

이 강의에서는 다음을 배웁니다:
• 수입무역의 기본 개념과 프로세스
• 해외 공급업체 발굴 및 협상 방법
• 무역 계약서 작성과 인코텀즈
• 수입 신고 및 통관 절차
• 관세와 부가세 계산 방법

실제 사례와 함께 배우는 실무 중심의 강의로, 수입무역 업무를 처음 시작하는 분들에게 적합합니다.`,
        price: 299000,
        thumbnail: null,
        category: '무역기초',
        level: '입문',
        instructor: '김무역',
        courseType: 'OFFLINE',
        startDate: '2026-02-15',
        endDate: '2026-02-15',
        capacity: 30,
        earlyBirdPrice: 249000,
        earlyBirdEndDate: '2026-02-08',
        location: '셀러노트 강남 교육장',
        locationAddress: '서울시 강남구 테헤란로 123 4층',
        locationUrl: 'https://naver.me/example',
        educationTime: '10:00~17:00 (점심시간 12:30~13:30)',
        targetAudience: [
          '처음 수입을 시작하는 사업자',
          '수입 업무를 맡게 된 실무자',
          '해외 소싱에 관심 있는 1인 셀러',
        ],
        benefits: [
          '수입 절차 전체 흐름을 이해할 수 있습니다',
          '해외 공급업체를 직접 찾을 수 있습니다',
          '인코텀즈를 활용해 계약서를 검토할 수 있습니다',
        ],
        lessons: [
          { id: '1-1', title: '수입무역이란?', duration: 30, order: 1 },
          { id: '1-2', title: '수입 프로세스 전체 흐름', duration: 45, order: 2 },
          { id: '1-3', title: '해외 공급업체 찾기', duration: 40, order: 3 },
          { id: '1-4', title: '협상과 계약', duration: 50, order: 4 },
          { id: '1-5', title: '인코텀즈 완전 정복', duration: 60, order: 5 },
          { id: '1-6', title: '통관 절차 이해하기', duration: 55, order: 6 },
          { id: '1-7', title: '관세와 세금 계산', duration: 40, order: 7 },
          { id: '1-8', title: '실전 사례 분석', duration: 45, order: 8 },
        ],
        _count: { enrollments: 22 },
      },
      '2': {
        id: '2',
        title: '관세사가 알려주는 통관실무',
        subtitle: 'HS코드부터 수입신고까지, 현직 관세사의 실전 노하우',
        description: `현직 관세사가 직접 알려주는 실전 통관 노하우를 배워보세요.`,
        price: 399000,
        thumbnail: null,
        category: '통관',
        level: '중급',
        instructor: '이관세',
        courseType: 'OFFLINE',
        startDate: '2026-02-22',
        endDate: '2026-02-22',
        capacity: 25,
        earlyBirdPrice: 349000,
        earlyBirdEndDate: '2026-02-15',
        location: '셀러노트 강남 교육장',
        locationAddress: '서울시 강남구 테헤란로 123 4층',
        locationUrl: null,
        educationTime: '10:00~18:00 (점심시간 12:30~13:30)',
        targetAudience: [
          '통관 업무를 맡게 된 실무자',
          '관세사 없이 직접 신고하고 싶은 분',
          'HS코드 분류가 어려운 분',
        ],
        benefits: [
          'HS코드를 직접 분류할 수 있습니다',
          '수입신고서를 직접 작성할 수 있습니다',
          '관세 계산을 정확히 할 수 있습니다',
        ],
        lessons: [
          { id: '2-1', title: '통관의 기본 개념', duration: 35, order: 1 },
          { id: '2-2', title: 'HS Code 분류 실무', duration: 60, order: 2 },
          { id: '2-3', title: '수입 신고서 작성하기', duration: 55, order: 3 },
          { id: '2-4', title: '과세가격 결정', duration: 50, order: 4 },
          { id: '2-5', title: '관세 계산 실습', duration: 45, order: 5 },
          { id: '2-6', title: '통관 트러블 대응', duration: 40, order: 6 },
        ],
        _count: { enrollments: 17 },
      },
    }

    return sampleCourses[id] || sampleCourses['1']
  }

  const handleEnroll = () => {
    if (!session) {
      router.push('/login')
      return
    }
    router.push(`/checkout?courseId=${course?.id}`)
  }

  const handleReservation = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsReserving(true)
    try {
      const response = await fetch(`/api/courses/${params.id}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        alert(`예약이 완료되었습니다. 대기 순번: ${data.position}번`)
        fetchReservationCount()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '예약에 실패했습니다.')
      }
    } catch {
      setError('예약 중 오류가 발생했습니다.')
    } finally {
      setIsReserving(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (reviewContent.length < 10) {
      setReviewError('수강평은 10자 이상 입력해주세요.')
      return
    }

    setIsSubmittingReview(true)
    setReviewError(null)

    try {
      const method = isEditingReview ? 'PATCH' : 'POST'
      const response = await fetch(`/api/courses/${params.id}/reviews`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          content: reviewContent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMyReview(data.review)
        setShowReviewForm(false)
        setIsEditingReview(false)
        fetchReviews()
      } else {
        setReviewError(data.error)
      }
    } catch {
      setReviewError('수강평 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!confirm('수강평을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/courses/${params.id}/reviews`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMyReview(null)
        setReviewRating(5)
        setReviewContent('')
        fetchReviews()
      }
    } catch {
      alert('수강평 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleEditReview = () => {
    setIsEditingReview(true)
    setShowReviewForm(true)
  }

  const totalDuration = course?.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0
  const totalHours = Math.floor(totalDuration / 60)
  const totalMinutes = totalDuration % 60

  // 잔여석 계산
  const remainingSeats = course?.capacity ? course.capacity - (course._count?.enrollments || 0) : null

  // 얼리버드 적용 여부
  const isEarlyBird = course?.earlyBirdEndDate ? new Date(course.earlyBirdEndDate) >= new Date() : false
  const currentPrice = isEarlyBird && course?.earlyBirdPrice ? course.earlyBirdPrice : (course?.price || 0)
  const discountRate = course?.earlyBirdPrice && course?.price
    ? Math.round((1 - course.earlyBirdPrice / course.price) * 100)
    : 0

  // 마감 임박 여부 (잔여 5석 이하)
  const isAlmostFull = remainingSeats !== null && remainingSeats <= 5 && remainingSeats > 0
  const isSoldOut = remainingSeats !== null && remainingSeats <= 0

  const renderStars = (rating: number, interactive = false, size = 'h-5 w-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewRating(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${size} ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">강의를 찾을 수 없습니다</h1>
        <Link href="/courses" className="text-[#6AAF50] hover:text-[#5A9A44]">
          강의 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            강의 목록
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(course.courseType === 'ONLINE' || course.courseType === 'LIVE_ONLINE') ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />
                    라이브 온라인
                  </span>
                ) : course.courseType === 'RECORDED' ? (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" />
                    녹화 강의
                  </span>
                ) : (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    라이브 오프라인
                  </span>
                )}
                <span className="bg-[#E8F5E3] text-[#5A9A44] px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
                {isEarlyBird && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    얼리버드
                  </span>
                )}
                {isAlmostFull && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    마감임박
                  </span>
                )}
                {isSoldOut && (
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    마감
                  </span>
                )}
                {course.tags && course.tags.map((courseTag) => (
                  <span
                    key={courseTag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: courseTag.tag.color }}
                  >
                    {courseTag.tag.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
              {course.subtitle && (
                <p className="text-lg text-gray-600 mb-4">&ldquo;{course.subtitle}&rdquo;</p>
              )}

              <p className="text-gray-600 mb-6">
                <span className="font-medium">{course.instructor}</span> 강사
              </p>

              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                {course.startDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-[#6AAF50]" />
                    <span className="font-medium">
                      {new Date(course.startDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                  </div>
                )}
                {course.educationTime && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {course.educationTime}
                  </div>
                )}
                {course.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {course.location}
                  </div>
                )}
                {remainingSeats !== null && (
                  <div className={`flex items-center ${isAlmostFull ? 'text-red-600 font-medium' : ''}`}>
                    <Users className="h-5 w-5 mr-2" />
                    잔여 {remainingSeats}석 / {course.capacity}석
                  </div>
                )}
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-1 fill-yellow-400 text-yellow-400" />
                    {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews}개 수강평)
                  </div>
                )}
              </div>
            </div>

            {/* Price Card - Desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl p-6 text-gray-900 shadow-lg border border-gray-200">
                {/* 얼리버드 가격 표시 */}
                {isEarlyBird && course.earlyBirdPrice ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                        {discountRate}% 할인
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {course.price.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">
                      {currentPrice.toLocaleString()}원
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      얼리버드 마감: {new Date(course.earlyBirdEndDate!).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}까지
                    </p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold mb-4">
                    {course.price.toLocaleString()}원
                  </p>
                )}

                {/* 잔여석 표시 */}
                {remainingSeats !== null && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    isSoldOut ? 'bg-gray-100' :
                    isAlmostFull ? 'bg-red-50' : 'bg-[#F5FAF3]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isSoldOut ? 'text-orange-600' :
                        isAlmostFull ? 'text-red-600' : 'text-[#6AAF50]'
                      }`}>
                        {isSoldOut ? `정원 마감 (예약 대기 ${reservationCount}명)` :
                         isAlmostFull ? `마감임박! 잔여 ${remainingSeats}석` :
                         `잔여 ${remainingSeats}석`}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {course.capacity}석
                      </span>
                    </div>
                    {!isSoldOut && (
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isAlmostFull ? 'bg-red-500' : 'bg-[#6AAF50]'
                          }`}
                          style={{ width: `${((course.capacity! - remainingSeats) / course.capacity!) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                {isSoldOut ? (
                  <button
                    onClick={handleReservation}
                    disabled={isReserving}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
                  >
                    {isReserving ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        처리 중...
                      </span>
                    ) : (
                      <>
                        예약하기
                        {reservationCount > 0 && (
                          <span className="ml-1 text-sm opacity-80">
                            (대기 {reservationCount}명)
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ) : isEnrolled ? (
                  <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    수강 신청 완료
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full bg-[#6AAF50] text-white py-3 rounded-lg hover:bg-[#5A9A44] font-medium disabled:opacity-50"
                  >
                    {isEnrolling ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        처리 중...
                      </span>
                    ) : (
                      '수강 신청하기'
                    )}
                  </button>
                )}

                <p className="text-sm text-gray-500 text-center mt-4">
                  30일 환불 보장
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* 이런 분에게 추천 */}
            {course.targetAudience && course.targetAudience.length > 0 && (
              <div className="bg-gradient-to-br from-[#F5FAF3] to-indigo-50 rounded-xl p-6 shadow-sm border border-[#E8F5E3]">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-[#6AAF50]" />
                  이런 분에게 추천합니다
                </h2>
                <ul className="space-y-3">
                  {course.targetAudience.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#6AAF50] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 교육에서 얻어가는 것 */}
            {course.benefits && course.benefits.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-green-600" />
                  교육에서 얻어가는 것
                </h2>
                <ul className="space-y-3">
                  {course.benefits.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">강의 소개</h2>
              <div className="prose prose-gray max-w-none whitespace-pre-wrap">
                {course.description}
              </div>
            </div>

            {/* Schedule & Location */}
            {(course.startDate || course.location || (course.schedules && course.schedules.length > 0)) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-[#6AAF50]" />
                  <h2 className="text-xl font-bold text-gray-900">교육 일정 및 장소</h2>
                </div>

                {/* 교육 기간 및 시간 */}
                <div className="bg-[#F5FAF3] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {course.startDate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">교육일</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(course.startDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                      </div>
                    )}
                    {course.educationTime && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">교육 시간</p>
                        <p className="font-semibold text-gray-900">{course.educationTime}</p>
                      </div>
                    )}
                    {course.location && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">교육 장소</p>
                        <p className="font-semibold text-gray-900">{course.location}</p>
                      </div>
                    )}
                    {course.schedules && course.schedules.length > 1 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">총 수강 횟수</p>
                        <p className="font-semibold text-[#6AAF50] text-lg">{course.schedules.length}회</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 장소 상세 정보 */}
                {(course.locationAddress || course.locationUrl) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        {course.locationAddress && (
                          <p className="text-gray-700">{course.locationAddress}</p>
                        )}
                        {course.locationUrl && (
                          <a
                            href={course.locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-[#6AAF50] hover:text-[#5A9A44] text-sm font-medium"
                          >
                            <ExternalLink className="h-4 w-4" />
                            지도에서 보기
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 개별 일정 목록 (다회차 교육인 경우) */}
                {course.schedules && course.schedules.length > 1 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">상세 일정</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {course.schedules.map((schedule, index) => {
                        const date = new Date(schedule.date)
                        const weekDays = ['일', '월', '화', '수', '목', '금', '토']
                        return (
                          <div
                            key={schedule.id}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                          >
                            <span className="w-6 h-6 bg-[#E8F5E3] text-[#6AAF50] rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">
                              {date.getMonth() + 1}/{date.getDate()}
                              <span className="text-gray-400 ml-1">({weekDays[date.getDay()]})</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowCurriculum(!showCurriculum)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  커리큘럼 ({course.lessons.length}개 강의)
                </h2>
                {showCurriculum ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {showCurriculum && (
                <div className="border-t border-gray-100">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-4">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{lesson.title}</span>
                      </div>
                      {lesson.duration && (
                        <span className="text-sm text-gray-500">{lesson.duration}분</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  수강평 {reviewStats && `(${reviewStats.totalReviews})`}
                </h2>
              </div>

              {/* Review Stats */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900">
                        {reviewStats.averageRating.toFixed(1)}
                      </p>
                      <div className="mt-2">
                        {renderStars(Math.round(reviewStats.averageRating))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {reviewStats.totalReviews}개의 수강평
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {reviewStats.distribution.map((d) => (
                        <div key={d.rating} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-12">{d.rating}점</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{
                                width: `${reviewStats.totalReviews > 0 ? (d.count / reviewStats.totalReviews) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* My Review or Review Form */}
              {session && (
                <div className="p-6 border-b border-gray-100">
                  {myReview && !showReviewForm ? (
                    <div className="bg-[#F5FAF3] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {myReview.user.profileImage ? (
                              <Image
                                src={myReview.user.profileImage}
                                alt={myReview.user.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{myReview.user.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(myReview.rating, false, 'h-4 w-4')}
                              <span className="text-sm text-gray-500">내 수강평</span>
                            </div>
                            <p className="text-gray-700 mt-2">{myReview.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditReview}
                            className="p-2 text-gray-500 hover:text-[#6AAF50]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleDeleteReview}
                            className="p-2 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : showReviewForm ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          별점
                        </label>
                        {renderStars(reviewRating, true, 'h-8 w-8')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          수강평
                        </label>
                        <textarea
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] resize-none"
                          placeholder="강의에 대한 솔직한 수강평을 남겨주세요. (10자 이상)"
                        />
                      </div>
                      {reviewError && (
                        <p className="text-sm text-red-600">{reviewError}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className="flex-1 bg-[#6AAF50] text-white py-2 rounded-lg hover:bg-[#5A9A44] font-medium disabled:opacity-50"
                        >
                          {isSubmittingReview ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="animate-spin h-5 w-5 mr-2" />
                              등록 중...
                            </span>
                          ) : isEditingReview ? (
                            '수강평 수정'
                          ) : (
                            '수강평 등록'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(false)
                            setIsEditingReview(false)
                            if (myReview) {
                              setReviewRating(myReview.rating)
                              setReviewContent(myReview.content)
                            }
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#6AAF50] hover:text-[#6AAF50] transition-colors"
                    >
                      수강평 작성하기
                    </button>
                  )}
                </div>
              )}

              {/* Reviews List */}
              <div className="divide-y divide-gray-100">
                {reviews.filter((r) => r.user.id !== session?.user?.id).length > 0 ? (
                  reviews
                    .filter((r) => r.user.id !== session?.user?.id)
                    .map((review) => (
                      <div key={review.id} className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {review.user.profileImage ? (
                              <Image
                                src={review.user.profileImage}
                                alt={review.user.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{review.user.name}</p>
                              <span className="text-sm text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <div className="mt-1">
                              {renderStars(review.rating, false, 'h-4 w-4')}
                            </div>
                            <p className="text-gray-700 mt-2">{review.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  !myReview && (
                    <div className="p-12 text-center text-gray-500">
                      아직 수강평이 없습니다.
                      <br />
                      첫 번째 수강평을 남겨보세요!
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">강사 소개</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#E8F5E3] rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-[#6AAF50]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{course.instructor}</h3>
                  <p className="text-gray-500">수입무역 전문가</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Mobile Sticky Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isEarlyBird && course.earlyBirdPrice ? (
                    <>
                      <span className="text-xl font-bold text-orange-600">
                        {currentPrice.toLocaleString()}원
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {course.price.toLocaleString()}원
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">{course.price.toLocaleString()}원</span>
                  )}
                </div>
                {remainingSeats !== null && !isSoldOut && (
                  <p className={`text-xs ${isAlmostFull ? 'text-red-600' : 'text-gray-500'}`}>
                    {isAlmostFull ? `마감임박! ` : ''}잔여 {remainingSeats}석
                  </p>
                )}
              </div>
              {isSoldOut ? (
                <button
                  onClick={handleReservation}
                  disabled={isReserving}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {isReserving ? '처리 중...' : `예약하기${reservationCount > 0 ? ` (${reservationCount})` : ''}`}
                </button>
              ) : isEnrolled ? (
                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  완료
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="bg-[#6AAF50] text-white px-6 py-2.5 rounded-lg hover:bg-[#5A9A44] font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {isEnrolling ? '처리 중...' : '신청하기'}
                </button>
              )}
            </div>
          </div>

          {/* 모바일 하단 여백 */}
          <div className="lg:hidden h-20" />
        </div>
      </div>
    </div>
  )
}
