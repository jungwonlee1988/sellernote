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
} from 'lucide-react'

interface Lesson {
  title: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
}

interface TagItem {
  id: string
  name: string
  color: string
}

const categories = ['무역기초', '통관', '물류', '국가별', 'FTA', '실무']
const levels = ['입문', '초급', '중급', '고급']
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
  const [lessons, setLessons] = useState<Lesson[]>([{ title: '', content: null, videoUrl: null, duration: 30, order: 1 }])

  // 일정 관련 state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // 태그 관련 state
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<'info' | 'lessons' | 'description' | 'schedule'>('info')

  useEffect(() => {
    fetchTags()
  }, [])

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

    if (!title || !description || !category || !level || !price || !instructor) {
      setError('모든 필수 항목을 입력해주세요.')
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
          startDate: startDate || null,
          endDate: endDate || null,
          lessons: lessons.filter(l => l.title.trim()).map((l, i) => ({
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            duration: l.duration,
            order: i + 1,
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
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
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

                      <input
                        type="text"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => updateLesson(index, 'videoUrl', e.target.value || null)}
                        placeholder="동영상 URL (YouTube, Vimeo 등)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm"
                      />

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
