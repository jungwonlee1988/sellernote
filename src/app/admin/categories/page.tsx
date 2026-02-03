'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Loader2,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  X,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  order: number
  isActive: boolean
  createdAt: string
}

const colorOptions = [
  { value: '#6B7280', label: '그레이' },
  { value: '#EF4444', label: '레드' },
  { value: '#F97316', label: '오렌지' },
  { value: '#F59E0B', label: '앰버' },
  { value: '#EAB308', label: '옐로우' },
  { value: '#84CC16', label: '라임' },
  { value: '#22C55E', label: '그린' },
  { value: '#14B8A6', label: '틸' },
  { value: '#06B6D4', label: '시안' },
  { value: '#3B82F6', label: '블루' },
  { value: '#6366F1', label: '인디고' },
  { value: '#8B5CF6', label: '바이올렛' },
  { value: '#A855F7', label: '퍼플' },
  { value: '#EC4899', label: '핑크' },
]

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 새 카테고리 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [isAdding, setIsAdding] = useState(false)

  // 수정 중인 카테고리
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        // 샘플 데이터 (API 실패 시)
        setCategories([
          { id: '1', name: '무역기초', description: '무역의 기본 개념과 실무', color: '#3B82F6', icon: null, order: 0, isActive: true, createdAt: '' },
          { id: '2', name: '통관', description: '수출입 통관 절차', color: '#22C55E', icon: null, order: 1, isActive: true, createdAt: '' },
          { id: '3', name: '물류', description: '국제 물류 및 운송', color: '#F59E0B', icon: null, order: 2, isActive: true, createdAt: '' },
          { id: '4', name: '국가별', description: '국가별 수출입 가이드', color: '#EC4899', icon: null, order: 3, isActive: true, createdAt: '' },
          { id: '5', name: 'FTA', description: '자유무역협정 활용', color: '#8B5CF6', icon: null, order: 4, isActive: true, createdAt: '' },
          { id: '6', name: '실무', description: '실무 노하우', color: '#6B7280', icon: null, order: 5, isActive: true, createdAt: '' },
        ])
      }
    } catch {
      setError('카테고리를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError('카테고리명을 입력해주세요.')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
          color: newColor,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCategories([...categories, data])
        setNewName('')
        setNewDescription('')
        setNewColor('#3B82F6')
        setShowAddForm(false)
        setSuccess('카테고리가 추가되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('카테고리 추가에 실패했습니다.')
    } finally {
      setIsAdding(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || '')
    setEditColor(category.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
    setEditColor('')
  }

  const handleSave = async (id: string) => {
    if (!editName.trim()) {
      setError('카테고리명을 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          color: editColor,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCategories(categories.map(c => c.id === id ? data : c))
        cancelEdit()
        setSuccess('카테고리가 수정되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('카테고리 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id))
        setSuccess('카테고리가 삭제되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('카테고리 삭제에 실패했습니다.')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const newCategories = [...categories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // 순서 교환
    ;[newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]]

    // 순서값 업데이트
    const updatedCategories = newCategories.map((c, i) => ({ ...c, order: i }))
    setCategories(updatedCategories)

    // API 호출
    try {
      await Promise.all([
        fetch(`/api/admin/categories/${updatedCategories[index].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: index }),
        }),
        fetch(`/api/admin/categories/${updatedCategories[targetIndex].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetIndex }),
        }),
      ])
    } catch {
      // 실패 시 원래대로
      fetchCategories()
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })

      if (response.ok) {
        setCategories(categories.map(c =>
          c.id === id ? { ...c, isActive: !currentActive } : c
        ))
      }
    } catch {
      setError('상태 변경에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
          <p className="text-gray-500">강의 카테고리를 추가하고 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
        >
          <Plus className="h-5 w-5" />
          <span>카테고리 추가</span>
        </button>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* 새 카테고리 추가 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">새 카테고리 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 무역기초"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="카테고리 설명"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                색상
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: newColor }}
                />
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                >
                  {colorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewName('')
                setNewDescription('')
                setNewColor('#3B82F6')
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50"
            >
              {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
              추가
            </button>
          </div>
        </div>
      )}

      {/* 카테고리 목록 */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 카테고리가 없습니다</h3>
          <p className="text-gray-500 mb-4">새 카테고리를 추가해보세요.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
          >
            <Plus className="h-5 w-5" />
            <span>카테고리 추가</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  순서
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  색상
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  상태
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(category.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleReorder(category.id, 'down')}
                          disabled={index === categories.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="설명 (선택)"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{category.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === category.id ? (
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] text-sm"
                      >
                        {colorOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex justify-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {colorOptions.find(c => c.value === category.color)?.label || '커스텀'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleActive(category.id, category.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {category.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() => handleSave(category.id)}
                            disabled={isSaving}
                            className="p-1.5 hover:bg-green-50 rounded text-green-600"
                            title="저장"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                            title="취소"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(category)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                            title="수정"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-500"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">카테고리 관리 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 카테고리 순서는 화살표 버튼으로 조정할 수 있습니다.</li>
          <li>• 비활성 카테고리는 강의 등록 시 선택 목록에서 숨겨집니다.</li>
          <li>• 강의에서 사용 중인 카테고리는 삭제할 수 없습니다.</li>
        </ul>
      </div>
    </div>
  )
}
