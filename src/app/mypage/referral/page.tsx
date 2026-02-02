'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Gift,
  TrendingUp,
  Share2,
  Loader2,
} from 'lucide-react'

interface ReferralInfo {
  referralCode: string
  referredBy: { id: string; name: string } | null
  stats: {
    totalReferrals: number
    totalEarnings: number
    pendingEarnings: number
    confirmedEarnings: number
    referrals: {
      id: string
      name: string
      createdAt: string
      hasPurchased: boolean
    }[]
  }
  rewards: {
    SIGNUP: number
    FIRST_PURCHASE: number
    SIGNUP_BONUS: number
  }
}

export default function ReferralPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchReferralInfo = async () => {
      try {
        const response = await fetch('/api/user/referral')
        if (response.ok) {
          const data = await response.json()
          setReferralInfo(data)
        }
      } catch (error) {
        console.error('Failed to fetch referral info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchReferralInfo()
    }
  }, [session])

  const handleCopyCode = async () => {
    if (!referralInfo?.referralCode) return
    try {
      await navigator.clipboard.writeText(referralInfo.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCopyLink = async () => {
    if (!referralInfo?.referralCode) return
    const link = `${window.location.origin}/register?ref=${referralInfo.referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (!referralInfo?.referralCode) return
    const link = `${window.location.origin}/register?ref=${referralInfo.referralCode}`
    const text = `셀러노트에서 함께 배워요! 추천 링크로 가입하면 1만원 할인 혜택을 받을 수 있어요.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '셀러노트 추천',
          text,
          url: link,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to share:', error)
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#6AAF50]" />
      </div>
    )
  }

  if (!session || !referralInfo) {
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
            <Users className="h-7 w-7 text-[#6AAF50]" />
            친구 추천
          </h1>
        </div>

        {/* My Referral Code */}
        <div className="bg-gradient-to-r from-[#6AAF50] to-[#5A9A44] rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-lg font-semibold mb-2">내 추천 코드</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-3 font-mono text-2xl tracking-wider">
              {referralInfo.referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  복사
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#6AAF50] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" />
                  링크 복사됨
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  추천 링크 복사
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              공유하기
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <Users className="h-6 w-6 text-[#6AAF50] mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {referralInfo.stats.totalReferrals}
            </p>
            <p className="text-sm text-gray-500">총 추천</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {referralInfo.stats.totalEarnings.toLocaleString()}원
            </p>
            <p className="text-sm text-gray-500">총 적립금</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <Gift className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {referralInfo.stats.confirmedEarnings.toLocaleString()}원
            </p>
            <p className="text-sm text-gray-500">사용 가능</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <Gift className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {referralInfo.stats.pendingEarnings.toLocaleString()}원
            </p>
            <p className="text-sm text-gray-500">대기중</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            추천 프로그램 안내
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-[#6AAF50] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">친구가 가입하면</p>
                <p className="text-sm text-gray-600">
                  추천인에게{' '}
                  <span className="font-bold text-[#6AAF50]">
                    {referralInfo.rewards.SIGNUP.toLocaleString()}원
                  </span>{' '}
                  적립
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">친구가 첫 결제하면</p>
                <p className="text-sm text-gray-600">
                  추천인에게{' '}
                  <span className="font-bold text-blue-500">
                    {referralInfo.rewards.FIRST_PURCHASE.toLocaleString()}원
                  </span>{' '}
                  추가 적립
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>친구 혜택:</strong> 추천 코드로 가입한 친구도{' '}
              <span className="font-bold">
                {referralInfo.rewards.SIGNUP_BONUS.toLocaleString()}원
              </span>{' '}
              할인 혜택을 받아요!
            </p>
          </div>
        </div>

        {/* Referral List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            내가 추천한 친구
          </h2>
          {referralInfo.stats.referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 추천한 친구가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">
                추천 코드를 공유하고 적립금을 받아보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referralInfo.stats.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6AAF50] text-white rounded-full flex items-center justify-center font-medium">
                      {referral.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(referral.createdAt)} 가입
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {referral.hasPurchased ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        결제 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        가입만 완료
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referred By */}
        {referralInfo.referredBy && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">나를 추천한 분</h3>
            <p className="text-blue-800">
              {referralInfo.referredBy.name}님의 추천으로 가입하셨습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
