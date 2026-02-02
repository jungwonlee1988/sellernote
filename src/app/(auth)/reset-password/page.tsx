'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setSuccess(true)
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          잘못된 접근
        </h2>
        <p className="mt-4 text-gray-600">
          비밀번호 재설정 링크가 올바르지 않습니다.
        </p>
        <div className="mt-8">
          <Link
            href="/forgot-password"
            className="block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
          >
            비밀번호 재설정 다시 요청
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          비밀번호 변경 완료
        </h2>
        <p className="mt-4 text-gray-600">
          비밀번호가 성공적으로 변경되었습니다.<br />
          새로운 비밀번호로 로그인해주세요.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <BookOpen className="h-10 w-10 text-[#6AAF50]" />
          <span className="text-2xl font-bold text-gray-900">SellerNote</span>
        </Link>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">새 비밀번호 설정</h2>
        <p className="mt-2 text-gray-600">
          새로운 비밀번호를 입력해주세요.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                placeholder="8자 이상 입력하세요"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#6AAF50] hover:bg-[#5A9A44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6AAF50] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              변경 중...
            </>
          ) : (
            '비밀번호 변경'
          )}
        </button>
      </form>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <Loader2 className="h-16 w-16 text-[#6AAF50] animate-spin mx-auto" />
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        로딩 중...
      </h2>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
