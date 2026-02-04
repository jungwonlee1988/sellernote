'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, Loader2, MapPin, Video, PlayCircle, Tag } from 'lucide-react'
import type { TagItem, CategoryItem, LevelItem, CourseType } from './types'

interface BasicInfoTabProps {
  title: string
  setTitle: (value: string) => void
  category: string
  setCategory: (value: string) => void
  level: string
  setLevel: (value: string) => void
  price: string
  setPrice: (value: string) => void
  instructor: string
  setInstructor: (value: string) => void
  thumbnail: string | null
  setThumbnail: (value: string | null) => void
  courseType: CourseType
  setCourseType: (value: CourseType) => void
  capacity: string
  setCapacity: (value: string) => void
  categories: CategoryItem[]
  levels: LevelItem[]
  availableTags: TagItem[]
  selectedTags: string[]
  toggleTag: (tagId: string) => void
  isUploading: boolean
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function BasicInfoTab({
  title,
  setTitle,
  category,
  setCategory,
  level,
  setLevel,
  price,
  setPrice,
  instructor,
  setInstructor,
  thumbnail,
  setThumbnail,
  courseType,
  setCourseType,
  capacity,
  setCapacity,
  categories,
  levels,
  availableTags,
  selectedTags,
  toggleTag,
  isUploading,
  onThumbnailUpload,
}: BasicInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
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
            onChange={onThumbnailUpload}
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
            <label
              className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                courseType === 'LIVE_OFFLINE'
                  ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
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
            <label
              className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                courseType === 'LIVE_ONLINE'
                  ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
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
            <label
              className={`flex flex-col items-center justify-center gap-2 px-4 py-4 border rounded-lg cursor-pointer transition-colors ${
                courseType === 'RECORDED'
                  ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
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
              녹화 강의는 라이브 온라인 강의 후 녹화본을 연결하여 생성합니다. 먼저
              라이브 온라인 강의를 생성하세요.
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
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
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
              <option key={lv.id} value={lv.name}>
                {lv.name}
              </option>
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
            <Link
              href="/admin/tags"
              className="text-[#6AAF50] hover:text-[#5A9A44]"
            >
              태그 관리
            </Link>
            에서 태그를 추가하세요.
          </p>
        )}
      </div>
    </div>
  )
}
