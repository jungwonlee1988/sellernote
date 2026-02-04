'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, Loader2, CheckCircle, Users, Check, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

// Step 1: 이메일 입력
const emailSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
})

// Step 2: 인증 코드 입력
const codeSchema = z.object({
  code: z.string().length(6, '6자리 인증 코드를 입력해주세요.'),
})

// Step 3: 나머지 정보 입력
const infoSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})

type EmailForm = z.infer<typeof emailSchema>
type CodeForm = z.infer<typeof codeSchema>
type InfoForm = z.infer<typeof infoSchema>

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [verifiedToken, setVerifiedToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)

  // Step 1 Form
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  // Step 2 Form
  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
  })

  // Step 3 Form
  const infoForm = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
  })

  const referralCode = infoForm.watch('referralCode')

  // URL에서 추천 코드 가져오기
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      infoForm.setValue('referralCode', refCode.toUpperCase())
    }
  }, [searchParams, infoForm])

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

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Step 1: 이메일 인증 코드 발송
  const onEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setEmail(data.email)
      setStep(2)
      setCountdown(600) // 10분 카운트다운
    } catch {
      setError('인증 코드 발송 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 인증 코드 재발송
  const resendCode = async () => {
    if (countdown > 540) return // 1분 이내 재발송 불가

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setCountdown(600)
      codeForm.reset()
    } catch {
      setError('인증 코드 재발송 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: 인증 코드 확인
  const onCodeSubmit = async (data: CodeForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: data.code }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      setVerifiedToken(result.verifiedToken)
      setStep(3)
    } catch {
      setError('인증 코드 확인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: 회원가입 완료
  const onInfoSubmit = async (data: InfoForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          referralCode: referralValid ? data.referralCode : undefined,
          verifiedToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

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
            셀러노트에 오신 것을 환영합니다.
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-[#6AAF50] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > s ? 'bg-[#6AAF50]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 이메일 입력 */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...emailForm.register('email')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                입력하신 이메일로 인증 코드가 발송됩니다.
              </p>
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
                '인증 코드 받기'
              )}
            </button>
          </form>
        )}

        {/* Step 2: 인증 코드 입력 */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-center">
              <p className="text-gray-600">
                <span className="font-medium text-gray-900">{email}</span>
                <br />으로 인증 코드를 발송했습니다.
              </p>
              {countdown > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  남은 시간: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                인증 코드
              </label>
              <input
                id="code"
                type="text"
                maxLength={6}
                {...codeForm.register('code')}
                className="block w-full text-center text-2xl tracking-[0.5em] py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                placeholder="000000"
              />
              {codeForm.formState.errors.code && (
                <p className="mt-1 text-sm text-red-600">{codeForm.formState.errors.code.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || countdown === 0}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#6AAF50] hover:bg-[#5A9A44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6AAF50] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  확인 중...
                </>
              ) : (
                '인증 확인'
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError(null)
                  codeForm.reset()
                }}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                이메일 변경
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={isLoading || countdown > 540}
                className="text-[#6AAF50] hover:text-[#5A9A44] disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                인증 코드 재발송
              </button>
            </div>
          </form>
        )}

        {/* Step 3: 나머지 정보 입력 */}
        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={infoForm.handleSubmit(onInfoSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span><strong>{email}</strong> 인증 완료</span>
            </div>

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
                    {...infoForm.register('name')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>
                {infoForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{infoForm.formState.errors.name.message}</p>
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
                    {...infoForm.register('phone')}
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
                    {...infoForm.register('password')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                    placeholder="8자 이상 입력하세요"
                  />
                </div>
                {infoForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{infoForm.formState.errors.password.message}</p>
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
                    {...infoForm.register('confirmPassword')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] focus:border-transparent"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
                {infoForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{infoForm.formState.errors.confirmPassword.message}</p>
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
                    {...infoForm.register('referralCode')}
                    onChange={(e) => infoForm.setValue('referralCode', e.target.value.toUpperCase())}
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
                '회원가입 완료'
              )}
            </button>
          </form>
        )}
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
