'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  CreditCard,
  Settings,
  ArrowLeft,
  Loader2,
  Tag,
  FileText,
  FolderOpen,
  Wrench,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

type MenuEntry = MenuItem | MenuGroup

const isMenuGroup = (entry: MenuEntry): entry is MenuGroup => {
  return 'items' in entry
}

const menuItems: MenuEntry[] = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '사용자 관리', href: '/admin/users', icon: Users },
  { name: '강의 관리', href: '/admin/courses', icon: BookOpen },
  { name: '과제 관리', href: '/admin/assignments', icon: FileText },
  { name: '게시글 관리', href: '/admin/posts', icon: MessageSquare },
  { name: '결제 관리', href: '/admin/payments', icon: CreditCard },
  {
    name: '도구관리',
    icon: Wrench,
    items: [
      { name: '카테고리', href: '/admin/categories', icon: FolderOpen },
      { name: '태그', href: '/admin/tags', icon: Tag },
      { name: '난이도', href: '/admin/levels', icon: BarChart3 },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['도구관리'])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    )
  }

  // 현재 경로가 그룹 내 항목에 해당하면 그룹 자동 확장
  useEffect(() => {
    menuItems.forEach(item => {
      if (isMenuGroup(item)) {
        const hasActiveChild = item.items.some(
          child => pathname === child.href || pathname.startsWith(child.href + '/')
        )
        if (hasActiveChild && !expandedGroups.includes(item.name)) {
          setExpandedGroups(prev => [...prev, item.name])
        }
      }
    })
  }, [pathname])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
        <p className="text-gray-500 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
        <Link href="/" className="text-[#6AAF50] hover:text-[#5A9A44]">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <Settings className="h-8 w-8 text-[#6AAF50]" />
            <span className="text-xl font-bold">관리자</span>
          </Link>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            if (isMenuGroup(item)) {
              const isExpanded = expandedGroups.includes(item.name)
              const hasActiveChild = item.items.some(
                child => pathname === child.href || pathname.startsWith(child.href + '/')
              )

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center justify-between px-6 py-3 transition-colors ${
                      hasActiveChild
                        ? 'text-[#6AAF50]'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="bg-gray-950">
                      {item.items.map((subItem) => {
                        const isActive = pathname === subItem.href ||
                          pathname.startsWith(subItem.href + '/')

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center space-x-3 pl-12 pr-6 py-2.5 transition-colors ${
                              isActive
                                ? 'bg-[#6AAF50] text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span className="text-sm">{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href + '/'))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-[#6AAF50] text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>사이트로 돌아가기</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
