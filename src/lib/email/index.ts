import { sendEmail, generateVerificationToken, generateVerificationCode } from './sender'
import {
  verificationEmailTemplate,
  verificationCodeEmailTemplate,
} from './templates/verification'
import { passwordResetEmailTemplate } from './templates/password-reset'
import { couponIssuedEmailTemplate } from './templates/coupon'

const baseUrl = process.env.NEXTAUTH_URL || ''

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  return sendEmail({
    to: email,
    subject: '[셀러노트] 이메일 인증을 완료해주세요',
    html: verificationEmailTemplate(verificationUrl),
  })
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: '[셀러노트] 이메일 인증 코드',
    html: verificationCodeEmailTemplate(code),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  return sendEmail({
    to: email,
    subject: '[셀러노트] 비밀번호 재설정',
    html: passwordResetEmailTemplate(resetUrl),
  })
}

export async function sendCouponIssuedEmail(
  email: string,
  userName: string,
  courseName: string,
  couponCode: string,
  amount: number,
  expiresAt: Date
) {
  const mypageUrl = `${baseUrl}/mypage/coupons`
  const formattedAmount = amount.toLocaleString()

  return sendEmail({
    to: email,
    subject: `[셀러노트] 수강 완료 기념 ${formattedAmount}원 할인 쿠폰이 발급되었습니다!`,
    html: couponIssuedEmailTemplate({
      userName,
      courseName,
      couponCode,
      amount,
      expiresAt,
      mypageUrl,
    }),
  })
}

export {
  sendEmail,
  generateVerificationToken,
  generateVerificationCode,
}
