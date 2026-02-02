'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  category: string
  level: string
  price: number
  instructor: string
  isPublished: boolean
  createdAt: string
  _count?: {
    enrollments: number
    lessons: number
  }
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
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
    {
      id: '1',
      title: '수입무역 입문 완성',
      category: '무역기초',
      level: '입문',
      price: 299000,
      instructor: '김무역',
      isPublished: true,
      createdAt: '2024-01-01T00:00:00Z',
      _count: { enrollments: 156, lessons: 8 },
    },
    {
      id: '2',
      title: '관세사가 알려주는 통관실무',
      category: '통관',
      level: '중급',
      price: 399000,
      instructor: '이관세',
      isPublished: true,
      createdAt: '2024-01-15T00:00:00Z',
      _count: { enrollments: 89, lessons: 6 },
    },
    {
      id: '3',
      title: '중국 수입 실전 가이드',
      category: '국가별',
      level: '중급',
      price: 349000,
      instructor: '박차이나',
      isPublished: true,
      createdAt: '2024-02-01T00:00:00Z',
      _count: { enrollments: 234, lessons: 10 },
    },
    {
      id: '4',
      title: 'FTA 활용 마스터 (준비중)',
      category: 'FTA',
      level: '고급',
      price: 449000,
      instructor: '정관세',
      isPublished: false,
      createdAt: '2024-02-15T00:00:00Z',
      _count: { enrollments: 0, lessons: 4 },
    },
  ]

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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.instructor.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
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

      {/* Courses Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 bg-gradient-to-br from-[#E8F5E3] to-[#D0EBCA] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-10 w-10 text-[#6AAF50]" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-[#6AAF50]">{course.category}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{course.level}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.instructor} 강사</p>
                    </div>
                    {course.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">공개</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">비공개</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="space-x-4 text-gray-500">
                      <span>{course._count?.lessons || 0}개 강의</span>
                      <span>{course._count?.enrollments || 0}명 수강</span>
                    </div>
                    <span className="font-semibold">{course.price.toLocaleString()}원</span>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-400">등록일: {formatDate(course.createdAt)}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePublish(course.id, course.isPublished)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        title={course.isPublished ? '비공개로 변경' : '공개로 변경'}
                      >
                        {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCourses.length === 0 && !isLoading && (
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
      )}
    </div>
  )
}
