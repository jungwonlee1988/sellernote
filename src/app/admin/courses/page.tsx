'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, BookOpen, Video, MapPin, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  category: string
  level: string
  price: number
  instructor: string
  isPublished: boolean
  courseType?: 'ONLINE' | 'OFFLINE' | 'LIVE_ONLINE' | 'LIVE_OFFLINE' | 'RECORDED'
  capacity?: number | null
  createdAt: string
  _count?: {
    enrollments: number
    lessons: number
    reservations?: number
  }
}

const ITEMS_PER_PAGE = 10

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        // DB 데이터가 없거나 유형이 다양하지 않으면 샘플 데이터 사용
        if (data.length === 0) {
          setCourses(sampleCourses)
        } else {
          // 다양한 유형 확인
          const hasLiveOnline = data.some((c: Course) => c.courseType === 'LIVE_ONLINE' || c.courseType === 'ONLINE')
          const hasRecorded = data.some((c: Course) => c.courseType === 'RECORDED')
          // 유형이 다양하지 않으면 샘플 데이터와 합침 (개발용)
          if (!hasLiveOnline || !hasRecorded) {
            setCourses([...data, ...sampleCourses])
          } else {
            setCourses(data)
          }
        }
      } else {
        setCourses(sampleCourses)
      }
    } catch {
      setCourses(sampleCourses)
    } finally {
      setIsLoading(false)
    }
  }

  const sampleCourses: Course[] = [
    // 라이브 오프라인
    {
      id: '1',
      title: '수입무역 입문 완성 - 현장 집중 교육',
      category: '무역기초',
      level: '입문',
      price: 299000,
      instructor: '김무역',
      isPublished: true,
      courseType: 'LIVE_OFFLINE',
      capacity: 30,
      createdAt: '2024-01-01T00:00:00Z',
      _count: { enrollments: 28, lessons: 8, reservations: 5 },
    },
    {
      id: '2',
      title: 'HS코드 분류 실습 워크샵',
      category: '통관',
      level: '중급',
      price: 350000,
      instructor: '박관세',
      isPublished: true,
      courseType: 'LIVE_OFFLINE',
      capacity: 20,
      createdAt: '2024-01-10T00:00:00Z',
      _count: { enrollments: 12, lessons: 4, reservations: 0 },
    },
    // 라이브 온라인
    {
      id: '3',
      title: '관세사가 알려주는 통관실무',
      category: '통관',
      level: '중급',
      price: 399000,
      instructor: '이관세',
      isPublished: true,
      courseType: 'LIVE_ONLINE',
      capacity: 50,
      createdAt: '2024-01-15T00:00:00Z',
      _count: { enrollments: 50, lessons: 6 },
    },
    {
      id: '4',
      title: 'FTA 활용 마스터 클래스',
      category: 'FTA',
      level: '고급',
      price: 449000,
      instructor: '정관세',
      isPublished: true,
      courseType: 'LIVE_ONLINE',
      capacity: 40,
      createdAt: '2024-02-01T00:00:00Z',
      _count: { enrollments: 45, lessons: 8 },
    },
    {
      id: '5',
      title: '수출입 물류 실무 (화상)',
      category: '물류',
      level: '중급',
      price: 320000,
      instructor: '최물류',
      isPublished: false,
      courseType: 'LIVE_ONLINE',
      capacity: 30,
      createdAt: '2024-02-15T00:00:00Z',
      _count: { enrollments: 0, lessons: 5 },
    },
    // 녹화 강의 (정원 무제한)
    {
      id: '6',
      title: '중국 수입 실전 가이드',
      category: '국가별',
      level: '중급',
      price: 199000,
      instructor: '박차이나',
      isPublished: true,
      courseType: 'RECORDED',
      capacity: null,
      createdAt: '2024-02-20T00:00:00Z',
      _count: { enrollments: 234, lessons: 12 },
    },
    {
      id: '7',
      title: '베트남 수입 A to Z',
      category: '국가별',
      level: '입문',
      price: 149000,
      instructor: '이베트남',
      isPublished: true,
      courseType: 'RECORDED',
      capacity: null,
      createdAt: '2024-03-01T00:00:00Z',
      _count: { enrollments: 178, lessons: 10 },
    },
    {
      id: '8',
      title: '무역영어 필수 표현 100',
      category: '무역기초',
      level: '입문',
      price: 99000,
      instructor: '김영어',
      isPublished: true,
      courseType: 'RECORDED',
      capacity: null,
      createdAt: '2024-03-10T00:00:00Z',
      _count: { enrollments: 412, lessons: 20 },
    },
    {
      id: '9',
      title: '인코텀즈 2020 완벽 해설',
      category: '무역기초',
      level: '중급',
      price: 129000,
      instructor: '박무역',
      isPublished: true,
      courseType: 'RECORDED',
      capacity: null,
      createdAt: '2024-03-15T00:00:00Z',
      _count: { enrollments: 289, lessons: 8 },
    },
    // 추가 라이브 오프라인
    {
      id: '10',
      title: '수출입 신고 실습 (2일 과정)',
      category: '통관',
      level: '고급',
      price: 550000,
      instructor: '이관세',
      isPublished: true,
      courseType: 'LIVE_OFFLINE',
      capacity: 15,
      createdAt: '2024-03-20T00:00:00Z',
      _count: { enrollments: 15, lessons: 6, reservations: 8 },
    },
    {
      id: '11',
      title: '원산지 증명 실무 특강',
      category: 'FTA',
      level: '중급',
      price: 280000,
      instructor: '정관세',
      isPublished: false,
      courseType: 'LIVE_OFFLINE',
      capacity: 25,
      createdAt: '2024-04-01T00:00:00Z',
      _count: { enrollments: 0, lessons: 4, reservations: 0 },
    },
    // 추가 녹화 강의
    {
      id: '12',
      title: '아마존 FBA 수출 입문',
      category: '실무',
      level: '입문',
      price: 179000,
      instructor: '김이커머스',
      isPublished: true,
      courseType: 'RECORDED',
      capacity: null,
      createdAt: '2024-04-10T00:00:00Z',
      _count: { enrollments: 567, lessons: 15 },
    },
  ]

  const getCourseTypeLabel = (courseType?: string) => {
    switch (courseType) {
      case 'LIVE_ONLINE':
      case 'ONLINE':
        return { label: '라이브 온라인', color: 'bg-blue-100 text-blue-700', icon: Video }
      case 'LIVE_OFFLINE':
      case 'OFFLINE':
        return { label: '라이브 오프라인', color: 'bg-purple-100 text-purple-700', icon: MapPin }
      case 'RECORDED':
        return { label: '녹화 강의', color: 'bg-amber-100 text-amber-700', icon: PlayCircle }
      default:
        return { label: '미지정', color: 'bg-gray-100 text-gray-700', icon: BookOpen }
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (response.ok) {
        setCourses(courses.map(c =>
          c.id === courseId ? { ...c, isPublished: !currentStatus } : c
        ))
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // 필터링
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'LIVE_ONLINE' && (course.courseType === 'LIVE_ONLINE' || course.courseType === 'ONLINE')) ||
      (typeFilter === 'LIVE_OFFLINE' && (course.courseType === 'LIVE_OFFLINE' || course.courseType === 'OFFLINE')) ||
      (typeFilter === 'RECORDED' && course.courseType === 'RECORDED')

    return matchesSearch && matchesType
  })

  // 페이지네이션
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  // 강의 유형별 카운트
  const typeCounts = {
    all: courses.length,
    LIVE_ONLINE: courses.filter(c => c.courseType === 'LIVE_ONLINE' || c.courseType === 'ONLINE').length,
    LIVE_OFFLINE: courses.filter(c => c.courseType === 'LIVE_OFFLINE' || c.courseType === 'OFFLINE').length,
    RECORDED: courses.filter(c => c.courseType === 'RECORDED').length,
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">강의 관리</h1>
          <p className="text-gray-500">강의를 등록하고 관리합니다.</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
        >
          <Plus className="h-5 w-5" />
          <span>새 강의 등록</span>
        </Link>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 유형 필터 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체 ({typeCounts.all})
            </button>
            <button
              onClick={() => setTypeFilter('LIVE_OFFLINE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                typeFilter === 'LIVE_OFFLINE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <MapPin className="h-4 w-4" />
              오프라인 ({typeCounts.LIVE_OFFLINE})
            </button>
            <button
              onClick={() => setTypeFilter('LIVE_ONLINE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                typeFilter === 'LIVE_ONLINE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Video className="h-4 w-4" />
              온라인 ({typeCounts.LIVE_ONLINE})
            </button>
            <button
              onClick={() => setTypeFilter('RECORDED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                typeFilter === 'RECORDED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              녹화 ({typeCounts.RECORDED})
            </button>
          </div>

          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="강의명 또는 강사명으로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
        </div>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 강의가 없습니다</h3>
          <p className="text-gray-500 mb-4">새 강의를 등록해보세요.</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
          >
            <Plus className="h-5 w-5" />
            <span>새 강의 등록</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강의 유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강의명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강사
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수강생
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCourses.map((course) => {
                const typeInfo = getCourseTypeLabel(course.courseType)
                const TypeIcon = typeInfo.icon
                const isLiveOnline = course.courseType === 'LIVE_ONLINE' || course.courseType === 'ONLINE'

                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${typeInfo.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400">{course._count?.lessons || 0}개 레슨 | {formatDate(course.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {course.instructor}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{course.category}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {course.level}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {(() => {
                        const enrolled = course._count?.enrollments || 0
                        const capacity = course.capacity
                        const overflow = capacity ? Math.max(0, enrolled - capacity) : 0

                        if (capacity) {
                          // 정원이 있는 경우: O명/O명 (초과 O명)
                          const displayEnrolled = overflow > 0 ? capacity : enrolled
                          return (
                            <div>
                              <span className={`text-sm font-medium ${overflow > 0 ? 'text-red-600' : enrolled === capacity ? 'text-amber-600' : 'text-gray-900'}`}>
                                {displayEnrolled}명/{capacity}명
                              </span>
                              {overflow > 0 && (
                                <span className="text-xs text-red-500 block">(초과 {overflow}명)</span>
                              )}
                              {course._count?.reservations && course._count.reservations > 0 && (
                                <span className="text-xs text-orange-600 block">대기 {course._count.reservations}명</span>
                              )}
                            </div>
                          )
                        } else {
                          // 정원 없음 (녹화 강의 등)
                          return (
                            <span className="text-sm font-medium text-gray-900">{enrolled}명</span>
                          )
                        }
                      })()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-gray-900">{course.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">원</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {course.isPublished ? (
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          공개
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          비공개
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-1">
                        {isLiveOnline && (
                          <Link
                            href={`/admin/courses/${course.id}/sessions`}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                            title="화상 수업 관리"
                          >
                            <Video className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleTogglePublish(course.id, course.isPublished)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          title={course.isPublished ? '비공개로 변경' : '공개로 변경'}
                        >
                          {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          title="수정"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-500"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                총 {filteredCourses.length}개 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}개 표시
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#6AAF50] text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
