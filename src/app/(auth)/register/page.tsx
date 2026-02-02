'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, Loader2, CheckCircle, Users, Check } from 'lucide-react'
import Image from 'next/image'

const registerSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const referralCode = watch('referralCode')

  // URL에서 추천 코드 가져오기
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setValue('referralCode', refCode.toUpperCase())
      validateReferralCode(refCode)
    }
  }, [searchParams, setValue])

  // 추천 코드 검증
  const validateReferralCode = async (code: string) => {
    if (!code || code.length !== 6) {
      setReferralValid(null)
      setReferrerName(null)
      return
    }

    setIsValidatingReferral(true)
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const result = await response.json()
      setReferralValid(result.valid)
      setReferrerName(result.referrer?.name || null)
    } catch {
      setReferralValid(false)
    } finally {
      setIsValidatingReferral(false)
    }
  }

  // 추천 코드 입력 시 자동 검증
  useEffect(() => {
    if (referralCode && referralCode.length === 6) {
      validateReferralCode(referralCode)
    } else {
      setReferralValid(null)
      setReferrerName(null)
    }
  }, [referralCode])

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          referralCode: referralValid ? data.referralCode : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setRegisteredEmail(data.email)
      setRegistered(true)
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            회원가입 완료!
          </h2>
          <p className="mt-4 text-gray-600">
            <span className="font-medium text-gray-900">{registeredEmail}</span>
            으로 인증 메일을 발송했습니다.
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            이메일의 인증 링크를 클릭하여 가입을 완료해주세요.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-[#6AAF50] text-white font-medium rounded-lg hover:bg-[#5A9A44] transition-colors"
            >
              로그인 페이지로 이동
            </Link>
            <p className="text-sm text-gray-500">
              이메일을 받지 못하셨나요?{' '}
              <button
                onClick={() => setRegistered(false)}
                className="text-[#6AAF50] hover:text-[#5A9A44] font-medium"
              >
                다시 시도하기
              </button>
            </p>
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#6AAF50] hover:text-[#5A9A44] font-medium">
              로그인
            </Link>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                  placeholder="홍길동"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
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

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 <span className="text-gray-400">(선택)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
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
                비밀번호 확인 <span className="text-red-500">*</span>
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

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                추천 코드 <span className="text-gray-400">(선택)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="referralCode"
                  type="text"
                  {...register('referralCode')}
                  onChange={(e) => setValue('referralCode', e.target.value.toUpperCase())}
                  maxLength={6}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent uppercase ${
                    referralValid === true
                      ? 'border-green-500 bg-green-50'
                      : referralValid === false
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="6자리 추천 코드"
                />
                {isValidatingReferral && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                )}
                {!isValidatingReferral && referralValid === true && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {referralValid === true && referrerName && (
                <p className="mt-1 text-sm text-green-600">
                  {referrerName}님의 추천으로 가입하면 1만원 할인 혜택!
                </p>
              )}
              {referralValid === false && (
                <p className="mt-1 text-sm text-red-600">유효하지 않은 추천 코드입니다.</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-[#6AAF50] focus:ring-[#6AAF50] border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              <Link href="/terms" className="text-[#6AAF50] hover:text-[#5A9A44]">
                이용약관
              </Link>
              과{' '}
              <Link href="/privacy" className="text-[#6AAF50] hover:text-[#5A9A44]">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#6AAF50] hover:bg-[#5A9A44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6AAF50] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6AAF50]" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
