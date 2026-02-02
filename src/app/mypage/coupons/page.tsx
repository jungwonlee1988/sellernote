'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ticket, Copy, Check, Gift, Clock, CheckCircle } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  amount: number
  status: 'ACTIVE' | 'USED' | 'EXPIRED'
  expiresAt: string
  usedAt: string | null
  createdAt: string
  enrollment: {
    course: {
      id: string
      title: string
    }
  }
  usedBy: {
    id: string
    name: string
  } | null
}

type FilterStatus = 'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED'

export default function CouponsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('/api/user/coupons')
        if (response.ok) {
          const data = await response.json()
          setCoupons(data)
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchCoupons()
    }
  }, [session])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === 'ALL') return true
    return coupon.status === filter
  })

  const getStatusBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Gift className="w-3 h-3 mr-1" />
            사용 가능
          </span>
        )
      case 'USED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            사용 완료
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            <Clock className="w-3 h-3 mr-1" />
            만료됨
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === 'ACTIVE').length,
    used: coupons.filter((c) => c.status === 'USED').length,
    expired: coupons.filter((c) => c.status === 'EXPIRED').length,
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6AAF50]"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/mypage"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            마이페이지로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="h-7 w-7 text-[#6AAF50]" />
            내 쿠폰
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">전체</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-[#6AAF50]">{stats.active}</p>
            <p className="text-sm text-gray-500">사용 가능</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.used}</p>
            <p className="text-sm text-gray-500">사용 완료</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
            <p className="text-sm text-gray-500">만료됨</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'ACTIVE', 'USED', 'EXPIRED'] as FilterStatus[]).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-[#6AAF50] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'ALL' && '전체'}
                {filterOption === 'ACTIVE' && '사용 가능'}
                {filterOption === 'USED' && '사용 완료'}
                {filterOption === 'EXPIRED' && '만료됨'}
              </button>
            ))}
          </div>
        </div>

        {/* Coupon List */}
        {filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'ALL'
                ? '보유한 쿠폰이 없습니다.'
                : `${filter === 'ACTIVE' ? '사용 가능한' : filter === 'USED' ? '사용 완료된' : '만료된'} 쿠폰이 없습니다.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  coupon.status !== 'ACTIVE' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex">
                  {/* Left side - Amount */}
                  <div
                    className={`w-32 flex-shrink-0 flex flex-col items-center justify-center p-4 ${
                      coupon.status === 'ACTIVE'
                        ? 'bg-[#6AAF50] text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <p className="text-2xl font-bold">
                      {(coupon.amount / 10000).toFixed(0)}만원
                    </p>
                    <p className="text-sm opacity-80">할인</p>
                  </div>

                  {/* Right side - Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {coupon.enrollment.course.title} 수강 완료 기념
                        </p>
                        {getStatusBadge(coupon.status)}
                      </div>
                    </div>

                    {/* Coupon Code */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 font-mono text-lg tracking-wider text-gray-800">
                        {coupon.code}
                      </div>
                      {coupon.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="flex items-center gap-1 px-4 py-2 bg-[#E8F5E3] text-[#6AAF50] rounded-lg hover:bg-[#D0EBCA] transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="h-4 w-4" />
                              복사됨
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              복사
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 text-sm text-gray-500">
                      {coupon.status === 'ACTIVE' && (
                        <p>유효기간: {formatDate(coupon.expiresAt)}까지</p>
                      )}
                      {coupon.status === 'USED' && coupon.usedAt && (
                        <p>
                          사용일: {formatDate(coupon.usedAt)}
                          {coupon.usedBy && ` (${coupon.usedBy.name}님이 사용)`}
                        </p>
                      )}
                      {coupon.status === 'EXPIRED' && (
                        <p>만료일: {formatDate(coupon.expiresAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">쿠폰 사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 쿠폰은 본인 또는 타인에게 선물하여 사용할 수 있습니다.</li>
            <li>• 결제 시 쿠폰 코드를 입력하면 할인이 적용됩니다.</li>
            <li>• 쿠폰은 유효기간 내에만 사용 가능합니다.</li>
            <li>• 사용한 쿠폰은 재사용이 불가능합니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
