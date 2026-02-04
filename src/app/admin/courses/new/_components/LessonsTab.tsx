'use client'

import { Plus, Trash2, GripVertical, Upload, Loader2, Video } from 'lucide-react'
import type { Lesson, CourseType } from './types'

interface LessonsTabProps {
  lessons: Lesson[]
  setLessons: (lessons: Lesson[]) => void
  courseType: CourseType
  vodEnabled: boolean
  uploadingLessonIndex: number | null
  onVideoUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
}

export function LessonsTab({
  lessons,
  setLessons,
  courseType,
  vodEnabled,
  uploadingLessonIndex,
  onVideoUpload,
}: LessonsTabProps) {
  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        content: null,
        videoUrl: null,
        duration: 30,
        order: lessons.length + 1,
        isPublic: false,
      },
    ])
  }

  const removeLesson = (index: number) => {
    if (lessons.length <= 1) return
    setLessons(
      lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 }))
    )
  }

  const updateLesson = (
    index: number,
    field: keyof Lesson,
    value: string | number | boolean | null
  ) => {
    setLessons(
      lessons.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    )
  }

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === lessons.length - 1) return

    const newLessons = [...lessons]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newLessons[index], newLessons[targetIndex]] = [
      newLessons[targetIndex],
      newLessons[index],
    ]
    setLessons(newLessons.map((l, i) => ({ ...l, order: i + 1 })))
  }

  return (
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
                      onChange={(e) =>
                        updateLesson(
                          index,
                          'duration',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
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
                      onChange={(e) =>
                        updateLesson(index, 'videoUrl', e.target.value || null)
                      }
                      placeholder="동영상 URL (YouTube, Vimeo 등) 또는 업로드"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm"
                    />
                    {(courseType === 'LIVE_OFFLINE' || courseType === 'RECORDED') && (
                      <label
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                          uploadingLessonIndex === index
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {uploadingLessonIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span className="text-sm whitespace-nowrap">
                          {uploadingLessonIndex === index
                            ? '업로드 중...'
                            : '비디오 업로드'}
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                          onChange={(e) => onVideoUpload(index, e)}
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
                        onChange={(e) =>
                          updateLesson(index, 'isPublic', e.target.checked)
                        }
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
                  onChange={(e) =>
                    updateLesson(index, 'content', e.target.value || null)
                  }
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
  )
}
