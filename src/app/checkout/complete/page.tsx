'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, BookOpen, ArrowRight, Loader2 } from 'lucide-react'

function CompleteContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            결제가 완료되었습니다!
          </h1>

          <p className="text-gray-600 mb-8">
            이제 강의를 수강하실 수 있습니다.
            <br />
            마이페이지에서 수강 중인 강의를 확인하세요.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">주문번호</span>
              <span className="font-mono text-gray-900">ORD-{Date.now()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={courseId ? `/courses/${courseId}` : '/mypage/courses'}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] font-medium"
            >
              <BookOpen className="h-5 w-5" />
              <span>강의 바로가기</span>
            </Link>

            <Link
              href="/mypage"
              className="flex items-center justify-center space-x-2 w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <span>마이페이지로 이동</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          결제 관련 문의: support@sellernote.com
        </p>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
      </div>
    }>
      <CompleteContent />
    </Suspense>
  )
}
