'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Save,
  Eye,
  EyeOff,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  MapPin,
  Users,
  Clock,
  Target,
  Award,
} from 'lucide-react'

interface Lesson {
  id?: string
  title: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
}

interface CourseSchedule {
  id?: string
  date: string
  title: string | null
}

interface TagItem {
  id: string
  name: string
  color: string
}

interface CourseTag {
  id: string
  tag: TagItem
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
  isPublished: boolean
  startDate: string | null
  endDate: string | null
  lessons: Lesson[]
  schedules: CourseSchedule[]
  tags?: CourseTag[]
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

const categories = ['무역기초', '통관', '물류', '국가별', 'FTA', '실무']
const levels = ['입문', '초급', '중급', '고급']
const weekDays = [
  { value: 0, label: '일' },
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
]

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionImageRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [price, setPrice] = useState('')
  const [instructor, setInstructor] = useState('')
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])

  // 오프라인 교육 관련 state
  const [capacity, setCapacity] = useState('')
  const [earlyBirdPrice, setEarlyBirdPrice] = useState('')
  const [earlyBirdEndDate, setEarlyBirdEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  const [educationTime, setEducationTime] = useState('')
  const [targetAudience, setTargetAudience] = useState<string[]>([])
  const [benefits, setBenefits] = useState<string[]>([])
  const [newTargetAudience, setNewTargetAudience] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  // Schedule state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [selectedWeekDays, setSelectedWeekDays] = useState<Set<number>>(new Set())
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // 태그 관련 state
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<'info' | 'lessons' | 'description' | 'schedule' | 'offline'>('info')

  useEffect(() => {
    fetchCourse()
    fetchTags()
  }, [params.id])

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

  const fetchCourse = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`)
      if (response.ok) {
        const data: Course = await response.json()
        setTitle(data.title)
        setSubtitle(data.subtitle || '')
        setDescription(data.description)
        setCategory(data.category)
        setLevel(data.level)
        setPrice(data.price.toString())
        setInstructor(data.instructor)
        setThumbnail(data.thumbnail)
        setIsPublished(data.isPublished)
        setLessons(data.lessons.length > 0 ? data.lessons : [{ title: '', content: null, videoUrl: null, duration: 30, order: 1 }])

        // Schedule data
        if (data.startDate) {
          setStartDate(data.startDate.split('T')[0])
        }
        if (data.endDate) {
          setEndDate(data.endDate.split('T')[0])
        }
        if (data.schedules && data.schedules.length > 0) {
          const dates = new Set(data.schedules.map(s => s.date.split('T')[0]))
          setSelectedDates(dates)
        }

        // Tags data
        if (data.tags && data.tags.length > 0) {
          setSelectedTags(data.tags.map(t => t.tag.id))
        }

        // 오프라인 교육 관련 data
        setCapacity(data.capacity?.toString() || '')
        setEarlyBirdPrice(data.earlyBirdPrice?.toString() || '')
        if (data.earlyBirdEndDate) {
          setEarlyBirdEndDate(data.earlyBirdEndDate.split('T')[0])
        }
        setLocation(data.location || '')
        setLocationAddress(data.locationAddress || '')
        setLocationUrl(data.locationUrl || '')
        setEducationTime(data.educationTime || '')
        setTargetAudience(data.targetAudience || [])
        setBenefits(data.benefits || [])
      } else {
        setError('강의를 불러올 수 없습니다.')
      }
    } catch {
      setError('강의를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const calendarDays = useMemo(() => getDaysInMonth(calendarMonth), [calendarMonth])

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    const dateStr = formatDateString(date)
    return dateStr >= startDate && dateStr <= endDate
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.has(formatDateString(date))
  }

  const toggleDate = (date: Date) => {
    if (!isDateInRange(date)) return

    const dateStr = formatDateString(date)
    const newDates = new Set(selectedDates)

    if (newDates.has(dateStr)) {
      newDates.delete(dateStr)
    } else {
      newDates.add(dateStr)
    }

    setSelectedDates(newDates)
  }

  const toggleWeekDay = (dayValue: number) => {
    const newWeekDays = new Set(selectedWeekDays)
    if (newWeekDays.has(dayValue)) {
      newWeekDays.delete(dayValue)
    } else {
      newWeekDays.add(dayValue)
    }
    setSelectedWeekDays(newWeekDays)
  }

  const applyWeekDays = () => {
    if (!startDate || !endDate || selectedWeekDays.size === 0) return

    const newDates = new Set(selectedDates)
    const start = new Date(startDate)
    const end = new Date(endDate)

    const current = new Date(start)
    while (current <= end) {
      if (selectedWeekDays.has(current.getDay())) {
        newDates.add(formatDateString(current))
      }
      current.setDate(current.getDate() + 1)
    }

    setSelectedDates(newDates)
  }

  const clearAllDates = () => {
    setSelectedDates(new Set())
    setSelectedWeekDays(new Set())
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
    setLessons([...lessons, { title: '', content: null, videoUrl: null, duration: 30, order: lessons.length + 1 }])
  }

  const removeLesson = (index: number) => {
    if (lessons.length <= 1) return
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 })))
  }

  const updateLesson = (index: number, field: keyof Lesson, value: string | number | null) => {
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

  const handleSubmit = async (publish?: boolean) => {
    setError(null)
    setSuccess(null)

    if (!title || !description || !category || !level || !price || !instructor) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    setIsSaving(true)

    try {
      const schedules = Array.from(selectedDates).map(date => ({
        date,
        title: null,
      }))

      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: subtitle || null,
          description,
          category,
          level,
          price: parseInt(price),
          instructor,
          thumbnail,
          isPublished: publish !== undefined ? publish : isPublished,
          startDate: startDate || null,
          endDate: endDate || null,
          lessons: lessons.filter(l => l.title.trim()).map((l, i) => ({
            ...l,
            order: i + 1,
            duration: l.duration || null,
          })),
          schedules,
          tagIds: selectedTags,
          // 오프라인 교육 관련
          capacity: capacity ? parseInt(capacity) : null,
          earlyBirdPrice: earlyBirdPrice ? parseInt(earlyBirdPrice) : null,
          earlyBirdEndDate: earlyBirdEndDate || null,
          location: location || null,
          locationAddress: locationAddress || null,
          locationUrl: locationUrl || null,
          educationTime: educationTime || null,
          targetAudience,
          benefits,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('강의가 저장되었습니다.')
        if (publish !== undefined) {
          setIsPublished(publish)
        }
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || '강의 저장에 실패했습니다.')
      }
    } catch {
      setError('강의 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          강의 목록으로
        </Link>
        <div className="flex items-center space-x-3">
          {isPublished ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <EyeOff className="h-4 w-4" />
              <span>비공개로 전환</span>
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50"
            >
              <Eye className="h-4 w-4" />
              <span>공개하기</span>
            </button>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? '저장 중...' : '저장'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">강의 수정</h1>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`px-2 py-1 text-xs rounded-full ${isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {isPublished ? '공개' : '비공개'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {success}
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
            activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>교육 일정 ({selectedDates.size})</span>
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'offline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          오프라인 설정
        </button>
      </div>

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
                {thumbnail && (
                  <button
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
                부제목 (한 줄 설명)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="예: HS코드부터 수입신고까지, 하루 만에 끝내는 통관 실무의 모든 것"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
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
                  <option key={cat} value={cat}>{cat}</option>
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
                  <option key={lv} value={lv}>{lv}</option>
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
          </div>

          <div className="flex items-center space-x-1 p-2 bg-gray-50 rounded-t-lg border border-b-0 border-gray-300">
            <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-gray-200 rounded" title="굵게">
              <Bold className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-gray-200 rounded" title="기울임">
              <Italic className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => insertMarkdown('\n- ')} className="p-2 hover:bg-gray-200 rounded" title="목록">
              <List className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => insertMarkdown('[링크텍스트](', ')')} className="p-2 hover:bg-gray-200 rounded" title="링크">
              <LinkIcon className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              type="button"
              onClick={() => descriptionImageRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-200 rounded text-sm"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span>이미지 삽입</span>
            </button>
            <input ref={descriptionImageRef} type="file" accept="image/*" onChange={handleDescriptionImageUpload} className="hidden" />
          </div>

          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={20}
            placeholder="강의에 대한 상세 설명을 입력하세요."
            className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] resize-none font-mono text-sm"
          />
        </div>
      )}

      {/* 커리큘럼 탭 */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">커리큘럼</h2>
            <button type="button" onClick={addLesson} className="flex items-center space-x-1 text-[#6AAF50] hover:text-[#5A9A44]">
              <Plus className="h-5 w-5" />
              <span>강의 추가</span>
            </button>
          </div>

          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-1">
                    <button type="button" onClick={() => moveLesson(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    <span className="w-8 h-8 bg-[#E8F5E3] rounded-full flex items-center justify-center text-sm font-medium text-[#6AAF50]">
                      {index + 1}
                    </span>
                    <button type="button" onClick={() => moveLesson(index, 'down')} disabled={index === lessons.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
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
                    <input
                      type="text"
                      value={lesson.videoUrl || ''}
                      onChange={(e) => updateLesson(index, 'videoUrl', e.target.value || null)}
                      placeholder="동영상 URL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm"
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
        </div>
      )}

      {/* 교육 일정 탭 */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">교육 일정 설정</h2>

          {/* 기간 설정 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">1. 교육 기간 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
            </div>
          </div>

          {/* 요일 선택 */}
          {startDate && endDate && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">2. 반복 요일 선택 (선택사항)</h3>
              <p className="text-sm text-gray-500 mb-4">선택한 요일에 해당하는 모든 날짜를 일괄 추가합니다.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekDay(day.value)}
                    className={`w-12 h-12 rounded-full font-medium transition-colors ${
                      selectedWeekDays.has(day.value)
                        ? 'bg-[#6AAF50] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#6AAF50]'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={applyWeekDays}
                disabled={selectedWeekDays.size === 0}
                className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50"
              >
                선택한 요일 적용
              </button>
            </div>
          )}

          {/* 달력에서 개별 날짜 선택 */}
          {startDate && endDate && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">3. 개별 날짜 선택</h3>
                <button
                  type="button"
                  onClick={clearAllDates}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  전체 초기화
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">달력에서 강의가 진행될 날짜를 클릭하여 선택/해제합니다.</p>

              {/* Calendar */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h4 className="font-semibold">
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

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day.value} className={`text-center text-sm font-medium py-2 ${day.value === 0 ? 'text-red-500' : day.value === 6 ? 'text-[#6AAF50]' : 'text-gray-500'}`}>
                      {day.label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-10" />
                    }

                    const inRange = isDateInRange(date)
                    const isSelected = isDateSelected(date)
                    const isToday = formatDateString(date) === formatDateString(new Date())
                    const dayOfWeek = date.getDay()

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDate(date)}
                        disabled={!inRange}
                        className={`h-10 rounded-lg text-sm font-medium transition-colors relative ${
                          isSelected
                            ? 'bg-[#6AAF50] text-white'
                            : inRange
                            ? 'bg-[#F5FAF3] text-gray-900 hover:bg-[#E8F5E3]'
                            : 'text-gray-300 cursor-not-allowed'
                        } ${isToday && !isSelected ? 'ring-2 ring-[#6AAF50]' : ''} ${
                          dayOfWeek === 0 && !isSelected ? 'text-red-500' : ''
                        } ${dayOfWeek === 6 && !isSelected ? 'text-[#6AAF50]' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 선택된 날짜 목록 */}
          {selectedDates.size > 0 && (
            <div className="p-4 bg-[#F5FAF3] rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">선택된 교육 일정 ({selectedDates.size}일)</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedDates).sort().map((dateStr) => (
                  <div
                    key={dateStr}
                    className="flex items-center space-x-1 px-3 py-1 bg-white rounded-full border border-[#D0EBCA]"
                  >
                    <span className="text-sm">
                      {new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDates = new Set(selectedDates)
                        newDates.delete(dateStr)
                        setSelectedDates(newDates)
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 오프라인 설정 탭 */}
      {activeTab === 'offline' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
          {/* 정원 및 가격 설정 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6AAF50]" />
              정원 및 가격 설정
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정원 (명)
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
                <p className="text-xs text-gray-500 mt-1">정원을 설정하면 잔여석이 표시됩니다</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  얼리버드 가격 (원)
                </label>
                <input
                  type="number"
                  value={earlyBirdPrice}
                  onChange={(e) => setEarlyBirdPrice(e.target.value)}
                  placeholder="120000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  얼리버드 마감일
                </label>
                <input
                  type="date"
                  value={earlyBirdEndDate}
                  onChange={(e) => setEarlyBirdEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
            </div>
          </div>

          {/* 교육 시간 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#6AAF50]" />
              교육 시간
            </h3>
            <input
              type="text"
              value={educationTime}
              onChange={(e) => setEducationTime(e.target.value)}
              placeholder="예: 10:00~17:00 (점심시간 12:30~13:30)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>

          {/* 장소 설정 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#6AAF50]" />
              교육 장소
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소명
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 셀러노트 강남 교육장"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 123 4층"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지도 URL (네이버맵/카카오맵 공유 링크)
                </label>
                <input
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://naver.me/xxxxx 또는 https://kko.to/xxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>
            </div>
          </div>

          {/* 추천 대상 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#6AAF50]" />
              이런 분에게 추천합니다
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTargetAudience}
                onChange={(e) => setNewTargetAudience(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTargetAudience.trim()) {
                    e.preventDefault()
                    setTargetAudience([...targetAudience, newTargetAudience.trim()])
                    setNewTargetAudience('')
                  }
                }}
                placeholder="예: 처음 수입을 시작하는 사업자"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTargetAudience.trim()) {
                    setTargetAudience([...targetAudience, newTargetAudience.trim()])
                    setNewTargetAudience('')
                  }
                }}
                className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {targetAudience.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-gray-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => setTargetAudience(targetAudience.filter((_, i) => i !== index))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 교육 후 얻어가는 것 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#6AAF50]" />
              교육에서 얻어가는 것
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newBenefit.trim()) {
                    e.preventDefault()
                    setBenefits([...benefits, newBenefit.trim()])
                    setNewBenefit('')
                  }
                }}
                placeholder="예: HS코드를 직접 분류할 수 있게 됩니다"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBenefit.trim()) {
                    setBenefits([...benefits, newBenefit.trim()])
                    setNewBenefit('')
                  }
                }}
                className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {benefits.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-gray-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => setBenefits(benefits.filter((_, i) => i !== index))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
