'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  BasicInfoTab,
  DescriptionTab,
  LessonsTab,
  ScheduleTab,
  VodSettingsTab,
  type Lesson,
  type TagItem,
  type CategoryItem,
  type LevelItem,
  type CourseType,
  type TabType,
} from './_components'

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '1', name: '무역기초', color: '#3B82F6', isActive: true },
  { id: '2', name: '통관', color: '#22C55E', isActive: true },
  { id: '3', name: '물류', color: '#F59E0B', isActive: true },
  { id: '4', name: '국가별', color: '#EC4899', isActive: true },
  { id: '5', name: 'FTA', color: '#8B5CF6', isActive: true },
  { id: '6', name: '실무', color: '#6B7280', isActive: true },
]

const DEFAULT_LEVELS: LevelItem[] = [
  { id: '1', name: '입문', description: null, isActive: true },
  { id: '2', name: '초급', description: null, isActive: true },
  { id: '3', name: '중급', description: null, isActive: true },
  { id: '4', name: '고급', description: null, isActive: true },
]

export default function NewCoursePage() {
  const router = useRouter()

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
  const [lessons, setLessons] = useState<Lesson[]>([
    { title: '', content: null, videoUrl: null, duration: 30, order: 1, isPublic: false },
  ])
  const [uploadingLessonIndex, setUploadingLessonIndex] = useState<number | null>(null)
  const [courseType, setCourseType] = useState<CourseType>('LIVE_OFFLINE')
  const [capacity, setCapacity] = useState('')

  const [vodEnabled, setVodEnabled] = useState(false)
  const [vodFreeDays, setVodFreeDays] = useState('14')
  const [vodPrice, setVodPrice] = useState('')
  const [vodExpiryDays, setVodExpiryDays] = useState('90')

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [levels, setLevels] = useState<LevelItem[]>([])

  const [activeTab, setActiveTab] = useState<TabType>('info')

  useEffect(() => {
    fetchTags()
    fetchCategories()
    fetchLevels()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setCategories(data.filter((c: CategoryItem) => c.isActive))
      } else {
        setCategories(DEFAULT_CATEGORIES)
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/levels')
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setLevels(data.filter((l: LevelItem) => l.isActive))
      } else {
        setLevels(DEFAULT_LEVELS)
      }
    } catch {
      setLevels(DEFAULT_LEVELS)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags')
      if (response.ok) {
        const result = await response.json()
        setAvailableTags(result.data || result)
      }
    } catch {
      // Ignore tag fetch errors
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId))
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

  const handleDescriptionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setDescription(description + `\n![이미지](${data.url})\n`)
      } else {
        setError(data.error)
      }
    } catch {
      setError('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setLessons(
          lessons.map((lesson, i) =>
            i === index ? { ...lesson, videoUrl: data.url } : lesson
          )
        )
      } else {
        setError(data.error || '비디오 업로드에 실패했습니다.')
      }
    } catch {
      setError('비디오 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingLessonIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const missingFields: string[] = []
    if (!title.trim()) missingFields.push('강의 제목')
    if (!description.trim()) missingFields.push('강의 설명')
    const validCategories = categories.map((c) => c.name)
    if (!category || !validCategories.includes(category)) missingFields.push('카테고리')
    const validLevels = levels.map((l) => l.name)
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
          vodEnabled,
          vodFreeDays: vodFreeDays ? parseInt(vodFreeDays) : null,
          vodPrice: vodPrice ? parseInt(vodPrice) : null,
          vodExpiryDays: vodExpiryDays ? parseInt(vodExpiryDays) : null,
          lessons: lessons
            .filter((l) => l.title.trim())
            .map((l, i) => ({
              title: l.title,
              content: l.content,
              videoUrl: l.videoUrl,
              duration: l.duration,
              order: i + 1,
              isPublic: l.isPublic,
            })),
          schedules: selectedDates.map((date) => ({ date })),
          tagIds: selectedTags,
        }),
      })

      if (response.ok) {
        router.push('/admin/courses')
      } else {
        const data = await response.json()
        setError(data.error?.message || data.error || '강의 등록에 실패했습니다.')
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
        {[
          { id: 'info', label: '기본 정보' },
          { id: 'description', label: '상세 설명' },
          { id: 'lessons', label: `커리큘럼 (${lessons.filter((l) => l.title).length})` },
          { id: 'schedule', label: `교육 일정 (${selectedDates.length})` },
          { id: 'vod', label: 'VOD 설정' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'info' && (
          <BasicInfoTab
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            level={level}
            setLevel={setLevel}
            price={price}
            setPrice={setPrice}
            instructor={instructor}
            setInstructor={setInstructor}
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            courseType={courseType}
            setCourseType={setCourseType}
            capacity={capacity}
            setCapacity={setCapacity}
            categories={categories}
            levels={levels}
            availableTags={availableTags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            isUploading={isUploading}
            onThumbnailUpload={handleThumbnailUpload}
          />
        )}

        {activeTab === 'description' && (
          <DescriptionTab
            description={description}
            setDescription={setDescription}
            isUploading={isUploading}
            onDescriptionImageUpload={handleDescriptionImageUpload}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsTab
            lessons={lessons}
            setLessons={setLessons}
            courseType={courseType}
            vodEnabled={vodEnabled}
            uploadingLessonIndex={uploadingLessonIndex}
            onVideoUpload={handleVideoUpload}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
          />
        )}

        {activeTab === 'vod' && (
          <VodSettingsTab
            courseType={courseType}
            vodEnabled={vodEnabled}
            setVodEnabled={setVodEnabled}
            vodFreeDays={vodFreeDays}
            setVodFreeDays={setVodFreeDays}
            vodPrice={vodPrice}
            setVodPrice={setVodPrice}
            vodExpiryDays={vodExpiryDays}
            setVodExpiryDays={setVodExpiryDays}
          />
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
