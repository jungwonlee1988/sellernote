'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, BookOpen, CreditCard, MessageSquare, Settings, ChevronRight, Pencil } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  profileImage: string | null
  bio: string | null
  role: string
  emailVerified: string | null
  createdAt: string
}

interface UserStats {
  enrolledCourses: number
  completedCourses: number
  postsCount: number
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    postsCount: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    if (session?.user) {
      fetchProfile()
      fetchStats()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6AAF50]"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const menuItems = [
    {
      icon: BookOpen,
      title: '내 강의',
      description: '수강 중인 강의 확인',
      href: '/mypage/courses',
    },
    {
      icon: CreditCard,
      title: '결제 내역',
      description: '구매한 강의 및 결제 정보',
      href: '/mypage/payments',
    },
    {
      icon: MessageSquare,
      title: '내 게시글',
      description: '작성한 게시글 및 댓글',
      href: '/mypage/posts',
    },
    {
      icon: Settings,
      title: '프로필 수정',
      description: '프로필 및 비밀번호 변경',
      href: '/mypage/edit',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#E8F5E3]">
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt="프로필 이미지"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-10 w-10 text-[#6AAF50]" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name || session.user.name}</h1>
                <p className="text-gray-500">{session.user.email}</p>
                {profile?.bio && (
                  <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
                )}
                <span className="inline-block mt-2 px-3 py-1 bg-[#E8F5E3] text-[#5A9A44] text-sm font-medium rounded-full">
                  {session.user.role === 'ADMIN' ? '관리자' : session.user.role === 'INSTRUCTOR' ? '강사' : '일반 회원'}
                </span>
              </div>
            </div>
            <Link
              href="/mypage/edit"
              className="flex items-center gap-1 px-4 py-2 text-sm text-[#6AAF50] hover:text-[#5A9A44] hover:bg-[#F5FAF3] rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              수정
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-[#6AAF50]">{stats.enrolledCourses}</p>
            <p className="text-gray-500 mt-1">수강 중인 강의</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
            <p className="text-gray-500 mt-1">완료한 강의</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.postsCount}</p>
            <p className="text-gray-500 mt-1">작성한 게시글</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
