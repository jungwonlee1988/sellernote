export interface EmailTemplateOptions {
  title: string
  preheader?: string
  content: string
  footerText?: string
}

export function baseEmailTemplate({
  title,
  preheader,
  content,
  footerText = '본 메일은 셀러노트에서 자동 발송되는 메일입니다.',
}: EmailTemplateOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
</head>
<body style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: #6AAF50; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">셀러노트</h1>
      <p style="color: #E8F5E3; margin: 10px 0 0; font-size: 14px;">${title}</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        ${footerText}
      </p>
    </div>
  </div>
</body>
</html>`
}

export function emailHeading(text: string): string {
  return `<h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">${text}</h2>`
}

export function emailParagraph(text: string): string {
  return `<p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">${text}</p>`
}

export function emailButton(href: string, text: string): string {
  return `<div style="text-align: center; margin: 30px 0;">
  <a href="${href}" style="display: inline-block; background-color: #6AAF50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
    ${text}
  </a>
</div>`
}

export function emailLink(href: string, text?: string): string {
  return `<a href="${href}" style="color: #6AAF50; word-break: break-all;">${text || href}</a>`
}

export function emailNote(text: string): string {
  return `<p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">${text}</p>`
}

export function emailBox(content: string, options?: { dashed?: boolean }): string {
  const borderStyle = options?.dashed ? '2px dashed #6AAF50' : '2px solid #6AAF50'
  return `<div style="background-color: #F5FAF3; border: ${borderStyle}; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
  ${content}
</div>`
}

export function emailCode(code: string, label?: string): string {
  return `<div style="background-color: #F5FAF3; border: 2px solid #6AAF50; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
  ${label ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">${label}</p>` : ''}
  <p style="color: #1f2937; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${code}</p>
</div>`
}

export function emailInfoBox(lines: string[]): string {
  const content = lines.map(line => `${line}<br>`).join('')
  return `<div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
  <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.8;">
    ${content}
  </p>
</div>`
}
