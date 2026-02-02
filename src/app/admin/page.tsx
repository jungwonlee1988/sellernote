'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  MessageSquare,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalCourses: number
  totalPosts: number
  totalRevenue: number
  newUsersThisMonth: number
  newEnrollmentsThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    newEnrollmentsThisMonth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // 샘플 데이터
        setStats({
          totalUsers: 1234,
          totalCourses: 24,
          totalPosts: 567,
          totalRevenue: 45678000,
          newUsersThisMonth: 89,
          newEnrollmentsThisMonth: 156,
        })
      }
    } catch {
      setStats({
        totalUsers: 1234,
        totalCourses: 24,
        totalPosts: 567,
        totalRevenue: 45678000,
        newUsersThisMonth: 89,
        newEnrollmentsThisMonth: 156,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: '총 회원수',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      href: '/admin/users',
      color: 'blue',
    },
    {
      title: '등록된 강의',
      value: stats.totalCourses.toLocaleString(),
      change: '+3',
      trend: 'up',
      icon: BookOpen,
      href: '/admin/courses',
      color: 'green',
    },
    {
      title: '게시글 수',
      value: stats.totalPosts.toLocaleString(),
      change: '+24',
      trend: 'up',
      icon: MessageSquare,
      href: '/admin/posts',
      color: 'purple',
    },
    {
      title: '총 매출',
      value: `${(stats.totalRevenue / 10000).toLocaleString()}만원`,
      change: '+18%',
      trend: 'up',
      icon: CreditCard,
      href: '/admin/payments',
      color: 'orange',
    },
  ]

  const recentActivities = [
    { type: 'user', message: '새 회원 가입: 홍길동', time: '5분 전' },
    { type: 'course', message: '강의 수강 신청: 수입무역 입문', time: '15분 전' },
    { type: 'post', message: '새 게시글 작성: Q&A 게시판', time: '30분 전' },
    { type: 'payment', message: '결제 완료: 299,000원', time: '1시간 전' },
    { type: 'user', message: '새 회원 가입: 김철수', time: '2시간 전' },
  ]

  const colorClasses = {
    blue: 'bg-[#E8F5E3] text-[#6AAF50]',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500">셀러노트 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 ml-1" />
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.title}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-gray-700">{activity.message}</span>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">이번 달 현황</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">신규 가입</span>
                <span className="font-semibold">{stats.newUsersThisMonth}명</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#6AAF50] h-2 rounded-full"
                  style={{ width: `${Math.min((stats.newUsersThisMonth / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">수강 신청</span>
                <span className="font-semibold">{stats.newEnrollmentsThisMonth}건</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.newEnrollmentsThisMonth / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">목표 달성률</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
