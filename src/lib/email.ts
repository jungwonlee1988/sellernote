import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'SellerNote <onboarding@resend.dev>',
      to: email,
      subject: '[SellerNote] 이메일 인증을 완료해주세요',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #1e40af; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SellerNote</h1>
              <p style="color: #93c5fd; margin: 10px 0 0; font-size: 14px;">수입무역 전문 교육 플랫폼</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">이메일 인증</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                안녕하세요!<br><br>
                SellerNote 회원가입을 환영합니다.<br>
                아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
                  이메일 인증하기
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
                <a href="${verificationUrl}" style="color: #1e40af; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                이 링크는 24시간 동안 유효합니다.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                본 메일은 SellerNote 회원가입 시 발송되는 자동 메일입니다.<br>
                회원가입을 요청하지 않으셨다면 이 메일을 무시해주세요.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export function generateVerificationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'SellerNote <onboarding@resend.dev>',
      to: email,
      subject: '[SellerNote] 비밀번호 재설정',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #1e40af; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SellerNote</h1>
              <p style="color: #93c5fd; margin: 10px 0 0; font-size: 14px;">수입무역 전문 교육 플랫폼</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">비밀번호 재설정</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                안녕하세요!<br><br>
                비밀번호 재설정 요청을 받았습니다.<br>
                아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
                  비밀번호 재설정
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
                <a href="${resetUrl}" style="color: #1e40af; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                이 링크는 1시간 동안 유효합니다.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시해주세요.<br>
                계정은 안전하게 보호됩니다.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
