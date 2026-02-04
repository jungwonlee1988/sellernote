import {
  baseEmailTemplate,
  emailHeading,
  emailParagraph,
  emailButton,
  emailBox,
  emailInfoBox,
} from './base'

interface CouponEmailOptions {
  userName: string
  courseName: string
  couponCode: string
  amount: number
  expiresAt: Date
  mypageUrl: string
}

export function couponIssuedEmailTemplate({
  userName,
  courseName,
  couponCode,
  amount,
  expiresAt,
  mypageUrl,
}: CouponEmailOptions): string {
  const formattedAmount = amount.toLocaleString()
  const formattedExpiry = expiresAt.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const couponBoxContent = `
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">쿠폰 코드</p>
    <p style="color: #1f2937; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0 0 16px;">${couponCode}</p>
    <p style="color: #6AAF50; font-size: 24px; font-weight: bold; margin: 0;">${formattedAmount}원 할인</p>
  `

  const content = `
    ${emailHeading(`${userName}님, 축하드립니다!`)}
    ${emailParagraph(`
      <strong style="color: #6AAF50;">${courseName}</strong> 과정을 성공적으로 완료하셨습니다!<br><br>
      수강 완료 기념으로 다음 강의 수강 시 사용하실 수 있는<br>
      특별 할인 쿠폰을 발급해 드립니다.
    `)}
    ${emailBox(couponBoxContent, { dashed: true })}
    ${emailInfoBox([
      '<strong>쿠폰 안내</strong>',
      `- 유효기간: <strong>${formattedExpiry}</strong>까지`,
      '- 본인 또는 지인에게 선물 가능',
      '- 모든 강의에 사용 가능',
    ])}
    ${emailButton(mypageUrl, '내 쿠폰 확인하기')}
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
      앞으로도 셀러노트와 함께 성장하는 여정을 응원합니다!
    </p>
  `

  return baseEmailTemplate({
    title: '수강 완료 축하 쿠폰',
    content,
    footerText: '본 메일은 수강 완료 시 자동 발송되는 메일입니다.<br>문의사항은 고객센터로 연락해주세요.',
  })
}
