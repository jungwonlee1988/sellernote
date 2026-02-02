'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
  courseTitle?: string
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('전체')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      } else {
        setPayments(samplePayments)
      }
    } catch {
      setPayments(samplePayments)
    } finally {
      setIsLoading(false)
    }
  }

  const samplePayments: Payment[] = [
    {
      id: 'PAY-001',
      amount: 299000,
      status: 'COMPLETED',
      paymentMethod: '신용카드',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      user: { name: '홍길동', email: 'hong@example.com' },
      courseTitle: '수입무역 입문 완성',
    },
    {
      id: 'PAY-002',
      amount: 399000,
      status: 'COMPLETED',
      paymentMethod: '무통장입금',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      user: { name: '김철수', email: 'kim@example.com' },
      courseTitle: '관세사가 알려주는 통관실무',
    },
    {
      id: 'PAY-003',
      amount: 349000,
      status: 'PENDING',
      paymentMethod: '무통장입금',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: { name: '이영희', email: 'lee@example.com' },
      courseTitle: '중국 수입 실전 가이드',
    },
    {
      id: 'PAY-004',
      amount: 299000,
      status: 'FAILED',
      paymentMethod: '신용카드',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user: { name: '박민수', email: 'park@example.com' },
      courseTitle: '수입무역 입문 완성',
    },
    {
      id: 'PAY-005',
      amount: 449000,
      status: 'REFUNDED',
      paymentMethod: '신용카드',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: { name: '최정호', email: 'choi@example.com' },
      courseTitle: '국제물류 완전정복',
    },
  ]

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setPayments(payments.map(p =>
          p.id === paymentId ? { ...p, status: newStatus } : p
        ))
      }
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  const statuses = ['전체', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user.name.toLowerCase().includes(search.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(search.toLowerCase()) ||
      payment.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === '전체' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="h-3 w-3" />
            <span>완료</span>
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="h-3 w-3" />
            <span>대기</span>
          </span>
        )
      case 'FAILED':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle className="h-3 w-3" />
            <span>실패</span>
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            <RefreshCw className="h-3 w-3" />
            <span>환불</span>
          </span>
        )
      default:
        return null
    }
  }

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
        <p className="text-gray-500">결제 내역을 조회하고 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">총 결제 완료</p>
          <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">입금 대기</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">총 건수</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}건</p>
        </div>
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
              placeholder="주문번호, 이름 또는 이메일로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
          >
            <option value="전체">전체 상태</option>
            <option value="COMPLETED">완료</option>
            <option value="PENDING">대기</option>
            <option value="FAILED">실패</option>
            <option value="REFUNDED">환불</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50] mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">주문번호</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">고객</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">강의</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">금액</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">결제수단</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{payment.user.name}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{payment.courseTitle}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {payment.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-gray-600">{payment.paymentMethod || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        총 {filteredPayments.length}건의 결제
      </div>
    </div>
  )
}
