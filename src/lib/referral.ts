import { prisma } from './prisma'

// 리퍼럴 보상 금액 설정
export const REFERRAL_REWARDS = {
  SIGNUP: 10000,        // 회원가입 시 추천인에게 지급
  FIRST_PURCHASE: 10000, // 피추천인 첫 결제 시 추천인에게 지급
  SIGNUP_BONUS: 10000,  // 회원가입 시 피추천인에게 지급 (환영 보너스)
}

/**
 * 6자리 랜덤 리퍼럴 코드 생성
 * 알파벳 대문자와 숫자 조합 (혼동 문자 제외: 0, O, I, L, 1)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 고유한 리퍼럴 코드 생성 (중복 체크)
 */
export async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode()
  let exists = await prisma.user.findUnique({ where: { referralCode: code } })

  while (exists) {
    code = generateReferralCode()
    exists = await prisma.user.findUnique({ where: { referralCode: code } })
  }

  return code
}

export interface ReferralCodeValidation {
  valid: boolean
  referrer?: {
    id: string
    name: string
  }
  error?: string
}

/**
 * 리퍼럴 코드 유효성 검증
 */
export async function validateReferralCode(code: string): Promise<ReferralCodeValidation> {
  if (!code || code.length !== 6) {
    return { valid: false, error: '유효하지 않은 추천 코드입니다.' }
  }

  const referrer = await prisma.user.findFirst({
    where: { referralCode: code.toUpperCase() },
    select: {
      id: true,
      name: true,
    },
  })

  if (!referrer) {
    return { valid: false, error: '존재하지 않는 추천 코드입니다.' }
  }

  return {
    valid: true,
    referrer,
  }
}

/**
 * 회원가입 시 리퍼럴 보상 처리
 */
export async function processSignupReferral(referrerId: string, refereeId: string): Promise<void> {
  // 추천인에게 보상 지급 (SIGNUP)
  await prisma.referralReward.create({
    data: {
      referrerId,
      refereeId,
      type: 'SIGNUP',
      amount: REFERRAL_REWARDS.SIGNUP,
      status: 'CONFIRMED',
    },
  })
}

/**
 * 첫 결제 시 리퍼럴 보상 처리
 */
export async function processFirstPurchaseReferral(userId: string): Promise<boolean> {
  // 해당 유저가 추천으로 가입했는지 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  })

  if (!user?.referredById) {
    return false // 추천인이 없음
  }

  // 이미 첫 결제 보상이 지급되었는지 확인
  const existingReward = await prisma.referralReward.findFirst({
    where: {
      refereeId: userId,
      type: 'FIRST_PURCHASE',
    },
  })

  if (existingReward) {
    return false // 이미 지급됨
  }

  // 추천인에게 첫 결제 보상 지급
  await prisma.referralReward.create({
    data: {
      referrerId: user.referredById,
      refereeId: userId,
      type: 'FIRST_PURCHASE',
      amount: REFERRAL_REWARDS.FIRST_PURCHASE,
      status: 'CONFIRMED',
    },
  })

  return true
}

export interface ReferralStats {
  totalReferrals: number
  totalEarnings: number
  pendingEarnings: number
  confirmedEarnings: number
  referrals: {
    id: string
    name: string
    createdAt: Date
    hasPurchased: boolean
  }[]
}

/**
 * 사용자의 리퍼럴 통계 조회
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  // 내가 추천한 사용자들
  const referrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      payments: {
        where: { status: 'COMPLETED' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 내 보상 내역
  const rewards = await prisma.referralReward.findMany({
    where: { referrerId: userId },
  })

  const totalEarnings = rewards.reduce((sum, r) => sum + r.amount, 0)
  const pendingEarnings = rewards
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0)
  const confirmedEarnings = rewards
    .filter((r) => r.status === 'CONFIRMED' || r.status === 'PAID')
    .reduce((sum, r) => sum + r.amount, 0)

  return {
    totalReferrals: referrals.length,
    totalEarnings,
    pendingEarnings,
    confirmedEarnings,
    referrals: referrals.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt,
      hasPurchased: r.payments.length > 0,
    })),
  }
}
