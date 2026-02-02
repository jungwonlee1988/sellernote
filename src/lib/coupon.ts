import { prisma } from './prisma'

/**
 * 8자리 랜덤 쿠폰 코드 생성
 * 알파벳 대문자와 숫자 조합 (혼동 문자 제외: 0, O, I, L)
 */
export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 고유한 쿠폰 코드 생성 (중복 체크)
 */
export async function generateUniqueCouponCode(): Promise<string> {
  let code = generateCouponCode()
  let exists = await prisma.coupon.findUnique({ where: { code } })

  while (exists) {
    code = generateCouponCode()
    exists = await prisma.coupon.findUnique({ where: { code } })
  }

  return code
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: {
    id: string
    code: string
    amount: number
    expiresAt: Date
    owner: {
      id: string
      name: string
    }
  }
  error?: string
}

/**
 * 쿠폰 유효성 검증
 */
export async function validateCoupon(code: string): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!coupon) {
    return { valid: false, error: '존재하지 않는 쿠폰 코드입니다.' }
  }

  if (coupon.status === 'USED') {
    return { valid: false, error: '이미 사용된 쿠폰입니다.' }
  }

  if (coupon.status === 'EXPIRED' || coupon.expiresAt < new Date()) {
    return { valid: false, error: '만료된 쿠폰입니다.' }
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      amount: coupon.amount,
      expiresAt: coupon.expiresAt,
      owner: coupon.owner,
    },
  }
}

export interface CouponUseResult {
  success: boolean
  error?: string
}

/**
 * 쿠폰 사용 처리
 * @param code 쿠폰 코드
 * @param userId 사용자 ID (본인 또는 타인)
 */
export async function applyCoupon(code: string, userId: string): Promise<CouponUseResult> {
  const validation = await validateCoupon(code)

  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        status: 'USED',
        usedById: userId,
        usedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to apply coupon:', error)
    return { success: false, error: '쿠폰 적용 중 오류가 발생했습니다.' }
  }
}

/**
 * 만료된 쿠폰 상태 업데이트 (크론잡에서 호출)
 */
export async function updateExpiredCoupons(): Promise<number> {
  const result = await prisma.coupon.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  })

  return result.count
}
