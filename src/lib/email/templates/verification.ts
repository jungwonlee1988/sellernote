import {
  baseEmailTemplate,
  emailHeading,
  emailParagraph,
  emailButton,
  emailLink,
  emailNote,
  emailCode,
} from './base'

export function verificationEmailTemplate(verificationUrl: string): string {
  const content = `
    ${emailHeading('이메일 인증')}
    ${emailParagraph(`
      안녕하세요!<br><br>
      셀러노트 회원가입을 환영합니다.<br>
      아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
    `)}
    ${emailButton(verificationUrl, '이메일 인증하기')}
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
      ${emailLink(verificationUrl)}
    </p>
    ${emailNote('이 링크는 24시간 동안 유효합니다.')}
  `

  return baseEmailTemplate({
    title: '수입무역 전문 교육 플랫폼',
    content,
    footerText: '본 메일은 셀러노트 회원가입 시 발송되는 자동 메일입니다.<br>회원가입을 요청하지 않으셨다면 이 메일을 무시해주세요.',
  })
}

export function verificationCodeEmailTemplate(code: string): string {
  const content = `
    ${emailHeading('이메일 인증 코드')}
    ${emailParagraph(`
      안녕하세요!<br><br>
      셀러노트 회원가입을 위한 인증 코드입니다.<br>
      아래 코드를 입력해주세요.
    `)}
    ${emailCode(code, '인증 코드')}
    ${emailNote('이 코드는 10분 동안 유효합니다.')}
  `

  return baseEmailTemplate({
    title: '수입무역 전문 교육 플랫폼',
    content,
    footerText: '본 메일은 셀러노트 회원가입 시 발송되는 자동 메일입니다.<br>회원가입을 요청하지 않으셨다면 이 메일을 무시해주세요.',
  })
}
