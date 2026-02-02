'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, BookOpen, Users, ChevronDown } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string | null
  category: string
  level: string
  instructor: string
  _count: {
    enrollments: number
  }
}

const categories = ['전체', '무역기초', '통관', '물류', '국가별', 'FTA']
const levels = ['전체', '입문', '초급', '중급', '고급']

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [level, setLevel] = useState('전체')
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [category, level])

  const fetchCourses = async (isSearch = false) => {
    setIsLoading(true)
    if (isSearch) setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (category !== '전체') params.append('category', category)
      if (level !== '전체') params.append('level', level)
      if (search) params.append('search', search)

      const response = await fetch(`/api/courses?${params}`)
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses(true)
  }

  // 샘플 데이터 (DB가 비어있을 때 표시)
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: '수입무역 입문 완성',
      description: '수입무역의 기초부터 실무까지 체계적으로 배우는 입문 과정입니다.',
      price: 299000,
      thumbnail: null,
      category: '무역기초',
      level: '입문',
      instructor: '김무역',
      _count: { enrollments: 156 },
    },
    {
      id: '2',
      title: '관세사가 알려주는 통관실무',
      description: '현직 관세사가 직접 알려주는 실전 통관 노하우를 배워보세요.',
      price: 399000,
      thumbnail: null,
      category: '통관',
      level: '중급',
      instructor: '이관세',
      _count: { enrollments: 89 },
    },
    {
      id: '3',
      title: '중국 수입 실전 가이드',
      description: '중국 수입의 모든 것, 알리바바부터 통관까지 한 번에 배우세요.',
      price: 349000,
      thumbnail: null,
      category: '국가별',
      level: '중급',
      instructor: '박차이나',
      _count: { enrollments: 234 },
    },
    {
      id: '4',
      title: '국제물류 완전정복',
      description: '해상, 항공, 육상 운송부터 물류 최적화까지 배우는 종합 과정입니다.',
      price: 449000,
      thumbnail: null,
      category: '물류',
      level: '중급',
      instructor: '최물류',
      _count: { enrollments: 67 },
    },
    {
      id: '5',
      title: 'FTA 활용 전략 마스터',
      description: 'FTA를 활용한 관세 절감 전략과 원산지 증명서 발급 실무를 배웁니다.',
      price: 379000,
      thumbnail: null,
      category: 'FTA',
      level: '고급',
      instructor: '정에프티에이',
      _count: { enrollments: 45 },
    },
    {
      id: '6',
      title: '무역영어 실무회화',
      description: '바이어와의 협상, 이메일 작성 등 실무에서 바로 쓰는 무역영어를 배웁니다.',
      price: 249000,
      thumbnail: null,
      category: '무역기초',
      level: '초급',
      instructor: '한영어',
      _count: { enrollments: 312 },
    },
  ]

  const displayCourses = courses.length > 0 ? courses : (hasSearched ? [] : sampleCourses)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 강의</h1>
          <p className="text-gray-600">수입무역 전문가가 되기 위한 다양한 강의를 만나보세요.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="강의 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>필터</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44]"
            >
              검색
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        category === cat
                          ? 'bg-[#6AAF50] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setLevel(lv)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        level === lv
                          ? 'bg-[#6AAF50] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="aspect-video bg-gradient-to-br from-[#E8F5E3] to-[#D0EBCA] relative flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#6AAF50]" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#6AAF50] text-white text-xs px-2 py-1 rounded">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-sm text-[#6AAF50] font-medium">{course.category}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      {course.price.toLocaleString()}원
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {course._count.enrollments}명
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {displayCourses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? `"${search}" 검색 결과가 없습니다` : '강의가 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">검색 조건을 변경해보세요.</p>
            {hasSearched && (
              <button
                onClick={async () => {
                  setSearch('')
                  setCategory('전체')
                  setLevel('전체')
                  setHasSearched(false)
                  // 전체 강의 다시 불러오기
                  const response = await fetch('/api/courses')
                  const data = await response.json()
                  setCourses(data.courses || [])
                }}
                className="text-[#6AAF50] hover:text-[#5A9A44] font-medium"
              >
                전체 강의 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
