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
  BarChart3,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'

interface Level {
  id: string
  name: string
  description: string | null
  order: number
  isActive: boolean
}

export default function LevelsManagement() {
  const [levels, setLevels] = useState<Level[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 새 난이도 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // 수정 중인 난이도
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/levels')
      if (response.ok) {
        const data = await response.json()
        setLevels(data)
      }
    } catch {
      setError('난이도를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError('난이도명을 입력해주세요.')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchLevels()
        setNewName('')
        setNewDescription('')
        setShowAddForm(false)
        setSuccess('난이도가 추가되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('난이도 추가에 실패했습니다.')
    } finally {
      setIsAdding(false)
    }
  }

  const startEdit = (level: Level) => {
    setEditingId(level.id)
    setEditName(level.name)
    setEditDescription(level.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
  }

  const handleSave = async (id: string) => {
    if (!editName.trim()) {
      setError('난이도명을 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchLevels()
        cancelEdit()
        setSuccess('난이도가 수정되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('난이도 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 난이도를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setLevels(levels.filter(l => l.id !== id))
        setSuccess('난이도가 삭제되었습니다.')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch {
      setError('난이도 삭제에 실패했습니다.')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = levels.findIndex(l => l.id === id)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === levels.length - 1) return

    const newLevels = [...levels]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    ;[newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]]

    const updatedLevels = newLevels.map((l, i) => ({ ...l, order: i }))
    setLevels(updatedLevels)

    try {
      await fetch('/api/admin/levels/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levels: updatedLevels.map((l, i) => ({ id: l.id, order: i })),
        }),
      })
    } catch {
      fetchLevels()
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })

      if (response.ok) {
        setLevels(levels.map(l =>
          l.id === id ? { ...l, isActive: !currentActive } : l
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
          <h1 className="text-2xl font-bold text-gray-900">난이도 관리</h1>
          <p className="text-gray-500">강의 난이도를 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
        >
          <Plus className="h-5 w-5" />
          <span>난이도 추가</span>
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

      {/* 새 난이도 추가 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">새 난이도 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                난이도명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 입문"
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
                placeholder="난이도 설명"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewName('')
                setNewDescription('')
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

      {/* 난이도 목록 */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
        </div>
      ) : levels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 난이도가 없습니다</h3>
          <p className="text-gray-500 mb-4">새 난이도를 추가해보세요.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
          >
            <Plus className="h-5 w-5" />
            <span>난이도 추가</span>
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
                  난이도명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
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
              {levels.map((level, index) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(level.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleReorder(level.id, 'down')}
                          disabled={index === levels.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {editingId === level.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{level.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === level.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="설명 (선택)"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{level.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleActive(level.id, level.isActive)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        level.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {level.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === level.id ? (
                        <>
                          <button
                            onClick={() => handleSave(level.id)}
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
                            onClick={() => startEdit(level)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                            title="수정"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(level.id, level.name)}
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
        <h3 className="font-medium text-blue-900 mb-2">난이도 관리 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 난이도 순서는 화살표 버튼으로 조정할 수 있습니다.</li>
          <li>• 비활성 난이도는 강의 등록 시 선택 목록에서 숨겨집니다.</li>
          <li>• 강의에서 사용 중인 난이도는 삭제할 수 없습니다.</li>
        </ul>
      </div>
    </div>
  )
}
