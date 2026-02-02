'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Eye, Trash2, MessageSquare, Loader2 } from 'lucide-react'

interface Post {
  id: string
  title: string
  category: string
  viewCount: number
  createdAt: string
  author: {
    name: string
  }
  _count: {
    comments: number
  }
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        setPosts(samplePosts)
      }
    } catch {
      setPosts(samplePosts)
    } finally {
      setIsLoading(false)
    }
  }

  const samplePosts: Post[] = [
    {
      id: '1',
      title: '중국 알리바바에서 첫 수입 도전하려고 합니다. 조언 부탁드려요!',
      category: 'Q&A',
      viewCount: 234,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: { name: '무역초보' },
      _count: { comments: 12 },
    },
    {
      id: '2',
      title: '수입무역 입문 완성 강의 수강 후기',
      category: '수강후기',
      viewCount: 156,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      author: { name: '열공중' },
      _count: { comments: 8 },
    },
    {
      id: '3',
      title: 'HS Code 분류 관련 질문입니다',
      category: 'Q&A',
      viewCount: 89,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      author: { name: '관세궁금' },
      _count: { comments: 5 },
    },
    {
      id: '4',
      title: '무역회사 취업 준비 팁 공유합니다',
      category: '취업/채용',
      viewCount: 312,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: { name: '취준성공' },
      _count: { comments: 23 },
    },
    {
      id: '5',
      title: '오늘도 통관 완료! 후기 남깁니다',
      category: '자유게시판',
      viewCount: 67,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: { name: '무역러' },
      _count: { comments: 4 },
    },
  ]

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const categories = ['전체', 'Q&A', '자유게시판', '수강후기', '취업/채용']

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
        <p className="text-gray-500">커뮤니티 게시글을 관리합니다.</p>
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
              placeholder="제목 또는 작성자로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">작성자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">조회</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">댓글</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">작성일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/community/${post.id}`}
                      className="text-gray-900 hover:text-[#6AAF50] line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#E8F5E3] text-[#5A9A44] text-xs rounded-full">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{post.author.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.viewCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post._count.comments}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        총 {filteredPosts.length}개의 게시글
      </div>
    </div>
  )
}
