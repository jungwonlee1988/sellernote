'use client'

import { useState, useEffect } from 'react'
import { Search, MoreVertical, UserCheck, UserX, Shield, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  _count?: {
    enrollments: number
    posts: number
  }
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('전체')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setUsers(sampleUsers)
      }
    } catch {
      setUsers(sampleUsers)
    } finally {
      setIsLoading(false)
    }
  }

  const sampleUsers: User[] = [
    {
      id: '1',
      email: 'admin@sellernote.com',
      name: '관리자',
      role: 'ADMIN',
      createdAt: '2024-01-01T00:00:00Z',
      _count: { enrollments: 0, posts: 5 },
    },
    {
      id: '2',
      email: 'instructor@sellernote.com',
      name: '김강사',
      role: 'INSTRUCTOR',
      createdAt: '2024-01-15T00:00:00Z',
      _count: { enrollments: 3, posts: 12 },
    },
    {
      id: '3',
      email: 'user1@example.com',
      name: '홍길동',
      role: 'USER',
      createdAt: '2024-02-01T00:00:00Z',
      _count: { enrollments: 5, posts: 8 },
    },
    {
      id: '4',
      email: 'user2@example.com',
      name: '김철수',
      role: 'USER',
      createdAt: '2024-02-10T00:00:00Z',
      _count: { enrollments: 2, posts: 3 },
    },
    {
      id: '5',
      email: 'user3@example.com',
      name: '이영희',
      role: 'USER',
      createdAt: '2024-02-15T00:00:00Z',
      _count: { enrollments: 4, posts: 1 },
    },
  ]

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (error) {
      console.error('Role change error:', error)
    }
    setSelectedUser(null)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === '전체' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">관리자</span>
      case 'INSTRUCTOR':
        return <span className="px-2 py-1 bg-[#E8F5E3] text-[#5A9A44] text-xs rounded-full">강사</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">일반</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-500">회원 정보를 조회하고 관리합니다.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 이메일로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
          >
            <option value="전체">전체 역할</option>
            <option value="USER">일반 회원</option>
            <option value="INSTRUCTOR">강사</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">역할</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">수강</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">게시글</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">가입일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 text-gray-600">{user._count?.enrollments || 0}개</td>
                  <td className="px-6 py-4 text-gray-600">{user._count?.posts || 0}개</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                      {selectedUser === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                          <button
                            onClick={() => handleChangeRole(user.id, 'USER')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>일반 회원으로 변경</span>
                          </button>
                          <button
                            onClick={() => handleChangeRole(user.id, 'INSTRUCTOR')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Shield className="h-4 w-4" />
                            <span>강사로 변경</span>
                          </button>
                          <button
                            onClick={() => handleChangeRole(user.id, 'ADMIN')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                          >
                            <Shield className="h-4 w-4" />
                            <span>관리자로 변경</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        총 {filteredUsers.length}명의 사용자
      </div>
    </div>
  )
}
