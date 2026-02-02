'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

interface TagItem {
  id: string
  name: string
  color: string
  _count: {
    courses: number
  }
}

const colorOptions = [
  { name: '파랑', value: '#3B82F6' },
  { name: '초록', value: '#22C55E' },
  { name: '빨강', value: '#EF4444' },
  { name: '노랑', value: '#EAB308' },
  { name: '보라', value: '#A855F7' },
  { name: '분홍', value: '#EC4899' },
  { name: '주황', value: '#F97316' },
  { name: '청록', value: '#14B8A6' },
  { name: '회색', value: '#6B7280' },
]

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#3B82F6')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (tag?: TagItem) => {
    if (tag) {
      setEditingTag(tag)
      setTagName(tag.name)
      setTagColor(tag.color)
    } else {
      setEditingTag(null)
      setTagName('')
      setTagColor('#3B82F6')
    }
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTag(null)
    setTagName('')
    setTagColor('#3B82F6')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      setError('태그 이름을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const url = editingTag
        ? `/api/admin/tags/${editingTag.id}`
        : '/api/admin/tags'
      const method = editingTag ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName, color: tagColor }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchTags()
        closeModal()
      } else {
        setError(data.error)
      }
    } catch {
      setError('태그 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (tag: TagItem) => {
    if (!confirm(`"${tag.name}" 태그를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTags()
      } else {
        alert('태그 삭제에 실패했습니다.')
      }
    } catch {
      alert('태그 삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">태그 관리</h1>
          <p className="text-gray-500">강의에 사용할 태그를 관리합니다.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
        >
          <Plus className="h-5 w-5" />
          <span>태그 추가</span>
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 태그가 없습니다</h3>
          <p className="text-gray-500 mb-4">첫 번째 태그를 추가해보세요.</p>
          <button
            onClick={() => openModal()}
            className="text-[#6AAF50] hover:text-[#5A9A44] font-medium"
          >
            태그 추가하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">태그</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">사용 강의 수</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tag._count.courses}개 강의
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(tag)}
                      className="p-2 text-gray-500 hover:text-[#6AAF50] hover:bg-[#F5FAF3] rounded-lg mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTag ? '태그 수정' : '태그 추가'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 이름
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="예: 베스트셀러"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 색상
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setTagColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        tagColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미리보기
                </label>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: tagColor }}
                >
                  {tagName || '태그 이름'}
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50"
                >
                  {isSubmitting ? '저장 중...' : editingTag ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
