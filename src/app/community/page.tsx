'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Search, MessageSquare, Eye, User, PenSquare, ChevronLeft, ChevronRight } from 'lucide-react'

interface Post {
  id: string
  title: string
  category: string
  viewCount: number
  createdAt: string
  author: {
    id: string
    name: string
  }
  _count: {
    comments: number
  }
}

const categories = ['전체', 'Q&A', '자유게시판', '수강후기', '취업/채용']

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [category, page])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== '전체') params.append('category', category)
      if (search) params.append('search', search)
      params.append('page', page.toString())

      const response = await fetch(`/api/posts?${params}`)
      const data = await response.json()
      setPosts(data.posts || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      // 샘플 데이터
      setPosts(samplePosts)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  const samplePosts: Post[] = [
    {
      id: '1',
      title: '중국 알리바바에서 첫 수입 도전하려고 합니다. 조언 부탁드려요!',
      category: 'Q&A',
      viewCount: 234,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: { id: '1', name: '무역초보' },
      _count: { comments: 12 },
    },
    {
      id: '2',
      title: '수입무역 입문 완성 강의 수강 후기',
      category: '수강후기',
      viewCount: 156,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      author: { id: '2', name: '열공중' },
      _count: { comments: 8 },
    },
    {
      id: '3',
      title: 'HS Code 분류 관련 질문입니다',
      category: 'Q&A',
      viewCount: 89,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      author: { id: '3', name: '관세궁금' },
      _count: { comments: 5 },
    },
    {
      id: '4',
      title: '무역회사 취업 준비 팁 공유합니다',
      category: '취업/채용',
      viewCount: 312,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: '4', name: '취준성공' },
      _count: { comments: 23 },
    },
    {
      id: '5',
      title: '오늘도 통관 완료! 후기 남깁니다',
      category: '자유게시판',
      viewCount: 67,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: { id: '5', name: '무역러' },
      _count: { comments: 4 },
    },
  ]

  const displayPosts = posts.length > 0 ? posts : samplePosts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
              <p className="text-gray-600">수입무역에 대한 질문과 경험을 나눠보세요.</p>
            </div>
            {session && (
              <Link
                href="/community/write"
                className="flex items-center space-x-2 bg-[#6AAF50] text-white px-4 py-2 rounded-lg hover:bg-[#5A9A44]"
              >
                <PenSquare className="h-5 w-5" />
                <span>글쓰기</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories & Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-[#6AAF50] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              검색
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="divide-y">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-[#6AAF50]">{post.category}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author.name}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post._count.comments}
                    </span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
              <p className="text-gray-500">첫 번째 글을 작성해보세요!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Write Button - Mobile */}
        {session && (
          <Link
            href="/community/write"
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#6AAF50] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5A9A44] z-40"
          >
            <PenSquare className="h-6 w-6" />
          </Link>
        )}
      </div>
    </div>
  )
}
