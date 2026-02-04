import * as postmark from 'postmark'
import {
  verificationEmailTemplate,
  verificationCodeEmailTemplate,
} from './email/templates/verification'
import { passwordResetEmailTemplate } from './email/templates/password-reset'
import { couponIssuedEmailTemplate } from './email/templates/coupon'

// Lazy initialization to avoid build-time errors
let client: postmark.ServerClient | null = null

function getPostmarkClient() {
  if (!client) {
    client = new postmark.ServerClient(process.env.POSTMARK_API_KEY || '')
  }
  return client
}

const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@seller-note.com'

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    const response = await getPostmarkClient().sendEmail({
      From: fromEmail,
      To: email,
      Subject: '[셀러노트] 이메일 인증을 완료해주세요',
      HtmlBody: verificationEmailTemplate(verificationUrl),
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending error:', error)
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    return { success: false, error: errorMsg }
  }
}

export function generateVerificationToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  try {
    const response = await getPostmarkClient().sendEmail({
      From: fromEmail,
      To: email,
      Subject: '[셀러노트] 이메일 인증 코드',
      HtmlBody: verificationCodeEmailTemplate(code),
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending error:', error)
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    return { success: false, error: errorMsg }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  try {
    const response = await getPostmarkClient().sendEmail({
      From: fromEmail,
      To: email,
      Subject: '[셀러노트] 비밀번호 재설정',
      HtmlBody: passwordResetEmailTemplate(resetUrl),
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending error:', error)
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    return { success: false, error: errorMsg }
  }
}

export async function sendCouponIssuedEmail(
  email: string,
  userName: string,
  courseName: string,
  couponCode: string,
  amount: number,
  expiresAt: Date
) {
  const mypageUrl = `${process.env.NEXTAUTH_URL}/mypage/coupons`
  const formattedAmount = amount.toLocaleString()

  try {
    const response = await getPostmarkClient().sendEmail({
      From: fromEmail,
      To: email,
      Subject: `[셀러노트] 수강 완료 기념 ${formattedAmount}원 할인 쿠폰이 발급되었습니다!`,
      HtmlBody: couponIssuedEmailTemplate({
        userName,
        courseName,
        couponCode,
        amount,
        expiresAt,
        mypageUrl,
      }),
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending error:', error)
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
    return { success: false, error: errorMsg }
  }
}
