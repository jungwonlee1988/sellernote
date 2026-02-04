'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Upload,
  GripVertical,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  MapPin,
  Video,
  PlayCircle,
} from 'lucide-react'

interface Lesson {
  title: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
  isPublic: boolean
}

interface TagItem {
  id: string
  name: string
  color: string
}

interface CategoryItem {
  id: string
  name: string
  color: string
  isActive: boolean
}

interface LevelItem {
  id: string
  name: string
  description: string | null
  isActive: boolean
}
const weekDays = ['일', '월', '화', '수', '목', '금', '토']

export default function NewCoursePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionImageRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [price, setPrice] = useState('')
  const [instructor, setInstructor] = useState('')
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([{ title: '', content: null, videoUrl: null, duration: 30, order: 1, isPublic: false }])
  const [uploadingLessonIndex, setUploadingLessonIndex] = useState<number | null>(null)
  const [courseType, setCourseType] = useState<'LIVE_ONLINE' | 'LIVE_OFFLINE' | 'RECORDED'>('LIVE_OFFLINE')
  const [capacity, setCapacity] = useState('')

  // VOD 관련 state
  const [vodEnabled, setVodEnabled] = useState(false)
  const [vodFreeDays, setVodFreeDays] = useState('14')  // 기본 2주
  const [vodPrice, setVodPrice] = useState('')
  const [vodExpiryDays, setVodExpiryDays] = useState('90')  // 기본 90일

  // 일정 관련 state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // 태그 관련 state
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 카테고리 관련 state
  const [categories, setCategories] = useState<CategoryItem[]>([])

  // 난이도 관련 state
  const [levels, setLevels] = useState<LevelItem[]>([])

  const [activeTab, setActiveTab] = useState<'info' | 'lessons' | 'description' | 'schedule' | 'vod'>('info')

  useEffect(() => {
    fetchTags()
    fetchCategories()
    fetchLevels()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter((c: CategoryItem) => c.isActive))
      } else {
        // API 실패 시 기본 카테고리
        setCategories([
          { id: '1', name: '무역기초', color: '#3B82F6', isActive: true },
          { id: '2', name: '통관', color: '#22C55E', isActive: true },
          { id: '3', name: '물류', color: '#F59E0B', isActive: true },
          { id: '4', name: '국가별', color: '#EC4899', isActive: true },
          { id: '5', name: 'FTA', color: '#8B5CF6', isActive: true },
          { id: '6', name: '실무', color: '#6B7280', isActive: true },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      // 기본 카테고리 설정
      setCategories([
        { id: '1', name: '무역기초', color: '#3B82F6', isActive: true },
        { id: '2', name: '통관', color: '#22C55E', isActive: true },
        { id: '3', name: '물류', color: '#F59E0B', isActive: true },
        { id: '4', name: '국가별', color: '#EC4899', isActive: true },
        { id: '5', name: 'FTA', color: '#8B5CF6', isActive: true },
        { id: '6', name: '실무', color: '#6B7280', isActive: true },
      ])
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/levels')
      if (response.ok) {
        const data = await response.json()
        setLevels(data.filter((l: LevelItem) => l.isActive))
      } else {
        // 폴백: 기본 난이도
        setLevels([
          { id: '1', name: '입문', description: null, isActive: true },
          { id: '2', name: '초급', description: null, isActive: true },
          { id: '3', name: '중급', description: null, isActive: true },
          { id: '4', name: '고급', description: null, isActive: true },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch levels:', error)
      setLevels([
        { id: '1', name: '입문', description: null, isActive: true },
        { id: '2', name: '초급', description: null, isActive: true },
        { id: '3', name: '중급', description: null, isActive: true },
        { id: '4', name: '고급', description: null, isActive: true },
      ])
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags')
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setThumbnail(data.url)
      } else {
        setError(data.error)
      }
    } catch {
      setError('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDescriptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        const textarea = textareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const imageMarkdown = `\n![이미지](${data.url})\n`
          const newDescription = description.substring(0, start) + imageMarkdown + description.substring(end)
          setDescription(newDescription)
        } else {
          setDescription(description + `\n![이미지](${data.url})\n`)
        }
      } else {
        setError(data.error)
      }
    } catch {
      setError('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = description.substring(start, end)
    const newText = description.substring(0, start) + prefix + selectedText + suffix + description.substring(end)
    setDescription(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const addLesson = () => {
    setLessons([...lessons, { title: '', content: null, videoUrl: null, duration: 30, order: lessons.length + 1, isPublic: false }])
  }

  const handleVideoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLessonIndex(index)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        updateLesson(index, 'videoUrl', data.url)
      } else {
        setError(data.error || '비디오 업로드에 실패했습니다.')
      }
    } catch {
      setError('비디오 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingLessonIndex(null)
    }
  }

  const removeLesson = (index: number) => {
    if (lessons.length <= 1) return
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 })))
  }

  const updateLesson = (index: number, field: keyof Lesson, value: string | number | boolean | null) => {
    setLessons(lessons.map((lesson, i) =>
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === lessons.length - 1) return

    const newLessons = [...lessons]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]]
    setLessons(newLessons.map((l, i) => ({ ...l, order: i + 1 })))
  }

  // 일정 관련 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false
    return dateStr >= startDate && dateStr <= endDate
  }

  const toggleDate = (day: number) => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const dateStr = formatDateString(new Date(year, month, day))

    if (!isInRange(dateStr)) return

    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr))
    } else {
      setSelectedDates([...selectedDates, dateStr].sort())
    }
  }

  const addWeeklyDays = () => {
    if (!startDate || !endDate || selectedDays.length === 0) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const newDates: string[] = [...selectedDates]

    const current = new Date(start)
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        const dateStr = formatDateString(current)
        if (!newDates.includes(dateStr)) {
          newDates.push(dateStr)
        }
      }
      current.setDate(current.getDate() + 1)
    }

    setSelectedDates(newDates.sort())
  }

  const removeDate = (dateStr: string) => {
    setSelectedDates(selectedDates.filter(d => d !== dateStr))
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}(${weekDays[date.getDay()]})`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 필수값 검증
    const missingFields: string[] = []
    if (!title.trim()) missingFields.push('강의 제목')
    if (!description.trim()) missingFields.push('강의 설명')
    // 카테고리가 빈 값이거나, 현재 카테고리 목록에 없는 경우
    const validCategories = categories.map(c => c.name)
    if (!category || !validCategories.includes(category)) missingFields.push('카테고리')
    // 난이도가 빈 값이거나, 난이도 목록에 없는 경우
    const validLevels = levels.map(l => l.name)
    if (!level || !validLevels.includes(level)) missingFields.push('난이도')
    if (!price || parseInt(price) < 0) missingFields.push('가격')
    if (!instructor.trim()) missingFields.push('강사명')

    if (missingFields.length > 0) {
      setError(`다음 필수 항목을 입력해주세요:\n• ${missingFields.join('\n• ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          price: parseInt(price),
          instructor,
          thumbnail,
          courseType,
          capacity: capacity ? parseInt(capacity) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          // VOD 설정
          vodEnabled,
          vodFreeDays: vodFreeDays ? parseInt(vodFreeDays) : null,
          vodPrice: vodPrice ? parseInt(vodPrice) : null,
          vodExpiryDays: vodExpiryDays ? parseInt(vodExpiryDays) : null,
          lessons: lessons.filter(l => l.title.trim()).map((l, i) => ({
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            duration: l.duration,
            order: i + 1,
            isPublic: l.isPublic,
          })),
          schedules: selectedDates.map(date => ({ date })),
          tagIds: selectedTags,
        }),
      })

      if (response.ok) {
        router.push('/admin/courses')
      } else {
        const data = await response.json()
        setError(data.error || '강의 등록에 실패했습니다.')
      }
    } catch {
      setError('강의 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Link
        href="/admin/courses"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        강의 목록으로
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">새 강의 등록</h1>
        <p className="text-gray-500">새로운 강의를 등록합니다.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          기본 정보
        </button>
        <button
          onClick={() => setActiveTab('description')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'description' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          상세 설명
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'lessons' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          커리큘럼 ({lessons.filter(l => l.title).length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          교육 일정 ({selectedDates.length})
        </button>
        <button
          onClick={() => setActiveTab('vod')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'vod' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          VOD 설정
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 탭 */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* 썸네일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 썸네일
              </label>
              <div className="flex items-start space-x-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center relative"
                >
                  {thumbnail ? (
                    <Image src={thumbnail} alt="썸네일" fill className="object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">클릭하여 업로드</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <div className="text-sm text-gray-500">
                  <p>권장 크기: 1280 x 720px</p>
                  <p>최대 파일 크기: 5MB</p>
                  <p>지원 형식: JPG, PNG, GIF, WEBP</p>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail(null)}
                      className="mt-2 text-red-500 hover:text-red-600"
                    >
                      이미지 삭제
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강의 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 수입무역 입문 완성"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강의 유형 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <label className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                    courseType === 'LIVE_OFFLINE'
                      ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="courseType"
                      value="LIVE_OFFLINE"
                      checked={courseType === 'LIVE_OFFLINE'}
                      onChange={() => setCourseType('LIVE_OFFLINE')}
                      className="sr-only"
                    />
                    <MapPin className="h-6 w-6" />
                    <span className="font-medium">라이브 오프라인</span>
                    <span className="text-xs text-gray-500">현장 교육</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                    courseType === 'LIVE_ONLINE'
                      ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="courseType"
                      value="LIVE_ONLINE"
                      checked={courseType === 'LIVE_ONLINE'}
                      onChange={() => setCourseType('LIVE_ONLINE')}
                      className="sr-only"
                    />
                    <Video className="h-6 w-6" />
                    <span className="font-medium">라이브 온라인</span>
                    <span className="text-xs text-gray-500">화상 수업</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                    courseType === 'RECORDED'
                      ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="courseType"
                      value="RECORDED"
                      checked={courseType === 'RECORDED'}
                      onChange={() => setCourseType('RECORDED')}
                      className="sr-only"
                    />
                    <PlayCircle className="h-6 w-6" />
                    <span className="font-medium">녹화 강의</span>
                    <span className="text-xs text-gray-500">VOD</span>
                  </label>
                </div>
                {courseType === 'RECORDED' && (
                  <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    녹화 강의는 라이브 온라인 강의 후 녹화본을 연결하여 생성합니다.
                    먼저 라이브 온라인 강의를 생성하세요.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정원
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="정원 미설정 시 무제한"
                  min={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
                <p className="mt-1 text-sm text-gray-500">
                  정원 초과 시 예약 대기로 전환됩니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                >
                  <option value="">선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                >
                  <option value="">선택하세요</option>
                  {levels.map((lv) => (
                    <option key={lv.id} value={lv.name}>{lv.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강사명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="강사 이름"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
            </div>

            {/* 태그 선택 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                태그
              </label>
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                          : 'text-white opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  등록된 태그가 없습니다.{' '}
                  <Link href="/admin/tags" className="text-[#6AAF50] hover:text-[#5A9A44]">
                    태그 관리
                  </Link>
                  에서 태그를 추가하세요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 상세 설명 탭 */}
        {activeTab === 'description' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 상세 설명 <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                마크다운 문법을 사용할 수 있습니다. 이미지를 삽입하려면 아래 버튼을 클릭하세요.
              </p>
            </div>

            {/* 에디터 툴바 */}
            <div className="flex items-center space-x-1 p-2 bg-gray-50 rounded-t-lg border border-b-0 border-gray-300">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="p-2 hover:bg-gray-200 rounded"
                title="굵게"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*')}
                className="p-2 hover:bg-gray-200 rounded"
                title="기울임"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('\n- ')}
                className="p-2 hover:bg-gray-200 rounded"
                title="목록"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[링크텍스트](', ')')}
                className="p-2 hover:bg-gray-200 rounded"
                title="링크"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <button
                type="button"
                onClick={() => descriptionImageRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-200 rounded text-sm"
                title="이미지 삽입"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                <span>이미지 삽입</span>
              </button>
              <input
                ref={descriptionImageRef}
                type="file"
                accept="image/*"
                onChange={handleDescriptionImageUpload}
                className="hidden"
              />
            </div>

            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={20}
              placeholder={`강의에 대한 상세 설명을 입력하세요.

마크다운 문법 예시:
# 제목
## 소제목
**굵은 글씨**
*기울임 글씨*
- 목록 항목
[링크](URL)
![이미지 설명](이미지URL)`}
              className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] resize-none font-mono text-sm"
            />

            <p className="mt-2 text-sm text-gray-500">
              {description.length}자 입력됨
            </p>
          </div>
        )}

        {/* 커리큘럼 탭 */}
        {activeTab === 'lessons' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">커리큘럼</h2>
                <p className="text-sm text-gray-500">강의 목차를 등록하고 관리합니다.</p>
              </div>
              <button
                type="button"
                onClick={addLesson}
                className="flex items-center space-x-1 text-[#6AAF50] hover:text-[#5A9A44]"
              >
                <Plus className="h-5 w-5" />
                <span>강의 추가</span>
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        type="button"
                        onClick={() => moveLesson(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </button>
                      <span className="w-8 h-8 bg-[#E8F5E3] rounded-full flex items-center justify-center text-sm font-medium text-[#6AAF50]">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveLesson(index, 'down')}
                        disabled={index === lessons.length - 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 rotate-180" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          placeholder="강의 제목"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(index, 'duration', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="0"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                          />
                          <span className="text-gray-500">분</span>
                        </div>
                      </div>

                      {/* 비디오 입력 영역 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(index, 'videoUrl', e.target.value || null)}
                            placeholder="동영상 URL (YouTube, Vimeo 등) 또는 업로드"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm"
                          />
                          {(courseType === 'LIVE_OFFLINE' || courseType === 'RECORDED') && (
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                              uploadingLessonIndex === index
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}>
                              {uploadingLessonIndex === index ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              <span className="text-sm whitespace-nowrap">
                                {uploadingLessonIndex === index ? '업로드 중...' : '비디오 업로드'}
                              </span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                onChange={(e) => handleVideoUpload(index, e)}
                                disabled={uploadingLessonIndex === index}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        {lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/') && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            업로드된 비디오: {lesson.videoUrl.split('/').pop()}
                          </p>
                        )}
                      </div>

                      {/* VOD 공개 여부 토글 */}
                      {(vodEnabled || courseType === 'RECORDED') && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lesson.isPublic}
                              onChange={(e) => updateLesson(index, 'isPublic', e.target.checked)}
                              className="w-4 h-4 text-[#6AAF50] border-gray-300 rounded focus:ring-[#6AAF50]"
                            />
                            <span className="text-sm text-gray-700">VOD 공개</span>
                          </label>
                          <span className="text-xs text-gray-500">
                            {lesson.isPublic ? '수강생에게 공개됨' : '수강생에게 비공개'}
                          </span>
                        </div>
                      )}

                      <textarea
                        value={lesson.content || ''}
                        onChange={(e) => updateLesson(index, 'content', e.target.value || null)}
                        placeholder="강의 내용 설명 (선택사항)"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      disabled={lessons.length <= 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={addLesson}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#6AAF50] hover:text-[#6AAF50] transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>새 강의 추가</span>
              </button>
            </div>
          </div>
        )}

        {/* 교육 일정 탭 */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-[#6AAF50]" />
              <h2 className="text-lg font-semibold text-gray-900">교육 일정 설정</h2>
            </div>

            {/* Step 1: 교육 기간 설정 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">1단계: 교육 기간 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setSelectedDates([])
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">종료일</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setSelectedDates([])
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: 반복 요일 선택 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">2단계: 반복 요일 선택 (선택사항)</h3>
              <p className="text-sm text-gray-500 mb-3">매주 반복되는 요일을 선택하면 해당 요일을 자동으로 추가합니다.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {weekDays.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (selectedDays.includes(index)) {
                        setSelectedDays(selectedDays.filter(d => d !== index))
                      } else {
                        setSelectedDays([...selectedDays, index])
                      }
                    }}
                    className={`w-10 h-10 rounded-full font-medium transition-colors ${
                      selectedDays.includes(index)
                        ? 'bg-[#6AAF50] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#6AAF50]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={addWeeklyDays}
                disabled={!startDate || !endDate || selectedDays.length === 0}
                className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                선택한 요일 일괄 추가
              </button>
            </div>

            {/* Step 3: 개별 날짜 선택 (달력) */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">3단계: 개별 날짜 선택</h3>
              <p className="text-sm text-gray-500 mb-3">달력에서 개별 날짜를 클릭하여 추가하거나 제거합니다.</p>

              {startDate && endDate ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  {/* 달력 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h4 className="text-lg font-medium">
                      {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 달력 그리드 */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(calendarMonth).map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="h-10" />
                      }

                      const dateStr = formatDateString(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))
                      const inRange = isInRange(dateStr)
                      const isSelected = selectedDates.includes(dateStr)

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDate(day)}
                          disabled={!inRange}
                          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#6AAF50] text-white'
                              : inRange
                                ? 'bg-[#F5FAF3] text-[#5A9A44] hover:bg-[#E8F5E3]'
                                : 'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">먼저 교육 기간을 설정해주세요.</p>
              )}
            </div>

            {/* 선택된 날짜 목록 */}
            <div className="p-4 bg-[#F5FAF3] rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                선택된 교육 일정 ({selectedDates.length}일)
              </h3>
              {selectedDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map(dateStr => (
                    <span
                      key={dateStr}
                      className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm border border-[#D0EBCA]"
                    >
                      {formatDisplayDate(dateStr)}
                      <button
                        type="button"
                        onClick={() => removeDate(dateStr)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">선택된 일정이 없습니다.</p>
              )}
              {selectedDates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDates([])}
                  className="mt-3 text-sm text-red-600 hover:text-red-700"
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>
        )}

        {/* VOD 설정 탭 */}
        {activeTab === 'vod' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <PlayCircle className="h-5 w-5 text-[#6AAF50]" />
              <h2 className="text-lg font-semibold text-gray-900">VOD 설정</h2>
            </div>

            {/* VOD 제공 여부 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">VOD(다시보기) 제공</p>
                  <p className="text-sm text-gray-500">
                    {courseType === 'RECORDED'
                      ? '녹화 강의는 VOD로 제공됩니다'
                      : '라이브 강의 종료 후 녹화본을 제공합니다'}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={vodEnabled || courseType === 'RECORDED'}
                    onChange={(e) => setVodEnabled(e.target.checked)}
                    disabled={courseType === 'RECORDED'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6AAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6AAF50]"></div>
                </div>
              </label>
            </div>

            {(vodEnabled || courseType === 'RECORDED') && (
              <>
                {/* 라이브 강의: 무료 제공 기간 */}
                {courseType !== 'RECORDED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      무료 제공 기간 (종료일 기준)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">종료일 +</span>
                      <input
                        type="number"
                        value={vodFreeDays}
                        onChange={(e) => setVodFreeDays(e.target.value)}
                        min={0}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                      <span className="text-gray-500">일</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      0으로 설정하면 무료 제공 없이 바로 추가 결제가 필요합니다
                    </p>
                  </div>
                )}

                {/* 녹화 강의: 시청 기간 */}
                {courseType === 'RECORDED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시청 가능 기간 (결제일 기준)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={vodExpiryDays}
                        onChange={(e) => setVodExpiryDays(e.target.value)}
                        min={1}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                      <span className="text-gray-500">일</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      결제일로부터 설정한 기간 동안 시청 가능합니다
                    </p>
                  </div>
                )}

                {/* 추가 결제 금액 (라이브 강의) */}
                {courseType !== 'RECORDED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추가 결제 금액 (무료 기간 종료 후)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={vodPrice}
                        onChange={(e) => setVodPrice(e.target.value)}
                        min={0}
                        placeholder="0"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                      <span className="text-gray-500">원</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      0으로 설정하면 무료 기간 종료 후 VOD를 제공하지 않습니다
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 안내 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">VOD 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {courseType === 'RECORDED' ? (
                  <>
                    <li>• 녹화 강의는 커리큘럼에 영상을 직접 업로드합니다</li>
                    <li>• 결제일로부터 설정한 기간 동안 시청 가능합니다</li>
                  </>
                ) : courseType === 'LIVE_ONLINE' ? (
                  <>
                    <li>• 화상 수업 진행 시 자동으로 녹화됩니다</li>
                    <li>• 녹화본은 관리자가 공개 여부를 선택할 수 있습니다</li>
                    <li>• 무료 기간 종료 후 추가 결제로 연장 가능합니다</li>
                  </>
                ) : (
                  <>
                    <li>• 오프라인 강의는 자동 녹화가 되지 않습니다</li>
                    <li>• 커리큘럼에서 영상을 직접 업로드하여 VOD를 제공할 수 있습니다</li>
                    <li>• 무료 기간 종료 후 추가 결제로 연장 가능합니다</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4 mt-6">
          <Link
            href="/admin/courses"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50 flex items-center"
          >
            {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
            {isSubmitting ? '등록 중...' : '강의 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}
