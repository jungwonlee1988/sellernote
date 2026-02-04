import {
  baseEmailTemplate,
  emailHeading,
  emailParagraph,
  emailButton,
  emailLink,
  emailNote,
} from './base'

export function passwordResetEmailTemplate(resetUrl: string): string {
  const content = `
    ${emailHeading('비밀번호 재설정')}
    ${emailParagraph(`
      안녕하세요!<br><br>
      비밀번호 재설정 요청을 받았습니다.<br>
      아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
    `)}
    ${emailButton(resetUrl, '비밀번호 재설정')}
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
      ${emailLink(resetUrl)}
    </p>
    ${emailNote('이 링크는 1시간 동안 유효합니다.')}
  `

  return baseEmailTemplate({
    title: '비밀번호 재설정',
    content,
    footerText: '비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시해주세요.<br>계정은 안전하게 보호됩니다.',
  })
}
