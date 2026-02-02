'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Eye, MessageSquare, User, Loader2, Trash2, Edit } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  viewCount: number
  createdAt: string
  author: {
    id: string
    name: string
  }
  comments: Comment[]
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        setPost(getSamplePost())
      }
    } catch {
      setPost(getSamplePost())
    } finally {
      setIsLoading(false)
    }
  }

  const getSamplePost = (): Post => ({
    id: params.id as string,
    title: '중국 알리바바에서 첫 수입 도전하려고 합니다. 조언 부탁드려요!',
    content: `안녕하세요, 수입무역에 관심을 가지고 있는 초보입니다.

알리바바에서 제품을 수입해보려고 하는데, 처음이라 어떻게 시작해야 할지 막막합니다.

궁금한 점들:
1. 알리바바에서 신뢰할 수 있는 업체를 어떻게 찾나요?
2. 샘플 주문은 어떻게 진행하나요?
3. 통관 절차는 어떻게 되나요?
4. 최소 주문 수량(MOQ)은 협상이 가능한가요?

경험 있으신 분들의 조언 부탁드립니다!`,
    category: 'Q&A',
    viewCount: 234,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { id: '1', name: '무역초보' },
    comments: [
      {
        id: '1',
        content: '알리바바에서 Gold Supplier 위주로 보시면 좋아요. 그리고 무조건 샘플 먼저 받아보세요!',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        author: { id: '2', name: '무역5년차' },
      },
      {
        id: '2',
        content: 'MOQ는 협상 가능합니다. 처음엔 작은 수량으로 테스트해보시는 게 좋아요.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        author: { id: '3', name: '중국통' },
      },
    ],
  })

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !comment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        const newComment = await response.json()
        setPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, newComment],
        } : null)
        setComment('')
      }
    } catch (error) {
      console.error('Comment submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/community')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h1>
        <Link href="/community" className="text-[#6AAF50] hover:text-[#5A9A44]">
          커뮤니티로 돌아가기
        </Link>
      </div>
    )
  }

  const isAuthor = session?.user?.id === post.author.id
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>

        {/* Post */}
        <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#6AAF50] bg-[#F5FAF3] px-3 py-1 rounded-full">
                {post.category}
              </span>
              {(isAuthor || isAdmin) && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/community/${post.id}/edit`}
                    className="p-2 text-gray-500 hover:text-[#6AAF50] hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center text-sm text-gray-500 space-x-4 pb-4 border-b">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author.name}
              </span>
              <span>{formatDate(post.createdAt)}</span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.viewCount}
              </span>
            </div>

            <div className="py-6 prose prose-gray max-w-none whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </article>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              댓글 {post.comments.length}개
            </h2>
          </div>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="p-4 border-b">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '등록 중...' : '댓글 등록'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 border-b text-center text-gray-500">
              <Link href="/login" className="text-[#6AAF50] hover:text-[#5A9A44]">
                로그인
              </Link>
              하시면 댓글을 작성할 수 있습니다.
            </div>
          )}

          {/* Comments List */}
          <div className="divide-y">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                첫 번째 댓글을 작성해보세요!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
