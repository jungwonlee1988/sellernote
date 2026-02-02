'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setSentEmail(data.email)
      setEmailSent(true)
    } catch {
      setError('요청 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            이메일 발송 완료
          </h2>
          <p className="mt-4 text-gray-600">
            <span className="font-medium text-gray-900">{sentEmail}</span>
            으로 비밀번호 재설정 링크를 발송했습니다.
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            이메일이 도착하지 않은 경우 스팸 폴더를 확인해주세요.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
            >
              로그인 페이지로 이동
            </Link>
            <button
              onClick={() => setEmailSent(false)}
              className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              다른 이메일로 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="셀러노트"
              width={200}
              height={200}
              className="h-20 w-auto mx-auto"
              unoptimized
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">비밀번호 찾기</h2>
          <p className="mt-2 text-gray-600">
            가입한 이메일 주소를 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#6AAF50] hover:bg-[#5A9A44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6AAF50] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                발송 중...
              </>
            ) : (
              '재설정 링크 발송'
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            로그인으로 돌아가기
          </Link>
        </form>
      </div>
    </div>
  )
}
