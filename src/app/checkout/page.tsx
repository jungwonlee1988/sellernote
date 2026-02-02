'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Smartphone, Building2, Loader2, BookOpen, Shield } from 'lucide-react'

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

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('결제 약관에 동의해주세요.')
      return
    }

    setIsProcessing(true)

    // 실제 결제 처리 대신 시뮬레이션
    setTimeout(() => {
      router.push(`/checkout/complete?courseId=${courseId}`)
    }, 2000)
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
                  <span>할인</span>
                  <span className="text-red-500">-0원</span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-[#6AAF50]">{course.price.toLocaleString()}원</span>
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
                  `${course.price.toLocaleString()}원 결제하기`
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
