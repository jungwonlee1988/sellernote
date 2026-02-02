'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('인증 토큰이 없습니다.')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error)
        }
      } catch {
        setStatus('error')
        setMessage('인증 처리 중 오류가 발생했습니다.')
      }
    }

    verifyEmail()
  }, [token])

  if (status === 'loading') {
    return (
      <>
        <Loader2 className="h-16 w-16 text-[#6AAF50] animate-spin mx-auto" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          이메일 인증 중...
        </h2>
        <p className="mt-2 text-gray-600">잠시만 기다려주세요.</p>
      </>
    )
  }

  if (status === 'success') {
    return (
      <>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          인증 완료!
        </h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
        >
          로그인하기
        </Link>
      </>
    )
  }

  return (
    <>
      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        인증 실패
      </h2>
      <p className="mt-2 text-gray-600">{message}</p>
      <div className="mt-6 space-y-3">
        <Link
          href="/register"
          className="block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
        >
          회원가입 다시하기
        </Link>
        <Link
          href="/"
          className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <>
      <Loader2 className="h-16 w-16 text-[#6AAF50] animate-spin mx-auto" />
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        로딩 중...
      </h2>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
