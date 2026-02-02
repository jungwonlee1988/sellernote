'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Smartphone, Building2, Loader2, BookOpen, Shield, Ticket, X, Check } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  instructor: string
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
    amount: number
  } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  const courseId = searchParams.get('courseId')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, status, router])

  const fetchCourse = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        setCourse(getSampleCourse())
      }
    } catch {
      setCourse(getSampleCourse())
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleCourse = (): Course => ({
    id: courseId || '1',
    title: '수입무역 입문 완성',
    price: 299000,
    instructor: '김무역',
  })

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('쿠폰 코드를 입력해주세요.')
      return
    }

    setIsValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      })

      const result = await response.json()

      if (result.valid && result.coupon) {
        setAppliedCoupon({
          id: result.coupon.id,
          code: result.coupon.code,
          amount: result.coupon.amount,
        })
        setCouponCode('')
        setCouponError('')
      } else {
        setCouponError(result.error || '유효하지 않은 쿠폰입니다.')
      }
    } catch {
      setCouponError('쿠폰 확인 중 오류가 발생했습니다.')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  const discountAmount = appliedCoupon?.amount || 0
  const finalPrice = Math.max(0, (course?.price || 0) - discountAmount)

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('결제 약관에 동의해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      // 쿠폰이 적용된 경우 사용 처리
      if (appliedCoupon) {
        const useResponse = await fetch('/api/coupons/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code }),
        })

        if (!useResponse.ok) {
          const error = await useResponse.json()
          alert(error.error || '쿠폰 사용 처리 중 오류가 발생했습니다.')
          setIsProcessing(false)
          return
        }
      }

      // 실제 결제 처리 대신 시뮬레이션
      setTimeout(() => {
        router.push(`/checkout/complete?courseId=${courseId}`)
      }, 2000)
    } catch {
      alert('결제 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    { id: 'card', name: '신용/체크카드', icon: CreditCard },
    { id: 'phone', name: '휴대폰 결제', icon: Smartphone },
    { id: 'bank', name: '무통장 입금', icon: Building2 },
  ]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  if (!session || !course) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          강의로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">결제하기</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 정보</h2>
              <div className="flex items-start space-x-4">
                <div className="w-24 h-16 bg-gradient-to-br from-[#E8F5E3] to-[#D0EBCA] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-[#6AAF50]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.instructor} 강사</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === method.id
                        ? 'border-[#6AAF50] bg-[#F5FAF3] text-[#6AAF50]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <method.icon className="h-5 w-5" />
                    <span className="font-medium">{method.name}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카드 번호
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        유효기간
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#6AAF50]" />
                쿠폰 적용
              </h2>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#F5FAF3] border border-[#6AAF50] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#6AAF50]" />
                    <span className="font-medium text-[#5A9A44]">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[#6AAF50]">
                      (-{appliedCoupon.amount.toLocaleString()}원)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError('')
                      }}
                      placeholder="쿠폰 코드 입력"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] uppercase"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        '적용'
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-red-500">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-[#6AAF50] rounded border-gray-300 focus:ring-[#6AAF50]"
                />
                <span className="text-sm text-gray-700">
                  주문 내용을 확인하였으며,{' '}
                  <Link href="/terms" className="text-[#6AAF50] hover:underline">
                    이용약관
                  </Link>
                  과{' '}
                  <Link href="/privacy" className="text-[#6AAF50] hover:underline">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다.
                </span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 금액</h2>

              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>강의 금액</span>
                  <span>{course.price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>쿠폰 할인</span>
                  <span className={discountAmount > 0 ? 'text-red-500' : ''}>
                    {discountAmount > 0 ? `-${discountAmount.toLocaleString()}원` : '-0원'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-[#6AAF50]">{finalPrice.toLocaleString()}원</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    결제 처리 중...
                  </>
                ) : (
                  `${finalPrice.toLocaleString()}원 결제하기`
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-1" />
                안전한 결제가 보장됩니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
