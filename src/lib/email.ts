import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || '셀러노트 <onboarding@resend.dev>',
      to: email,
      subject: '[셀러노트] 이메일 인증을 완료해주세요',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #6AAF50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">셀러노트</h1>
              <p style="color: #E8F5E3; margin: 10px 0 0; font-size: 14px;">수입무역 전문 교육 플랫폼</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">이메일 인증</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                안녕하세요!<br><br>
                셀러노트 회원가입을 환영합니다.<br>
                아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #6AAF50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
                  이메일 인증하기
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
                <a href="${verificationUrl}" style="color: #6AAF50; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                이 링크는 24시간 동안 유효합니다.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                본 메일은 셀러노트 회원가입 시 발송되는 자동 메일입니다.<br>
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

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || '셀러노트 <onboarding@resend.dev>',
      to: email,
      subject: '[셀러노트] 이메일 인증 코드',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #6AAF50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">셀러노트</h1>
              <p style="color: #E8F5E3; margin: 10px 0 0; font-size: 14px;">수입무역 전문 교육 플랫폼</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">이메일 인증 코드</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                안녕하세요!<br><br>
                셀러노트 회원가입을 위한 인증 코드입니다.<br>
                아래 코드를 입력해주세요.
              </p>
              <div style="background-color: #F5FAF3; border: 2px solid #6AAF50; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">인증 코드</p>
                <p style="color: #1f2937; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${code}</p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
                이 코드는 10분 동안 유효합니다.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                본 메일은 셀러노트 회원가입 시 발송되는 자동 메일입니다.<br>
                회원가입을 요청하지 않으셨다면 이 메일을 무시해주세요.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification code email:', error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return { success: false, error: errorMsg };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || '셀러노트 <onboarding@resend.dev>',
      to: email,
      subject: '[셀러노트] 비밀번호 재설정',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #6AAF50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">셀러노트</h1>
              <p style="color: #E8F5E3; margin: 10px 0 0; font-size: 14px;">수입무역 전문 교육 플랫폼</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">비밀번호 재설정</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                안녕하세요!<br><br>
                비밀번호 재설정 요청을 받았습니다.<br>
                아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #6AAF50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
                  비밀번호 재설정
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣기 해주세요:<br>
                <a href="${resetUrl}" style="color: #6AAF50; word-break: break-all;">${resetUrl}</a>
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

export async function sendCouponIssuedEmail(
  email: string,
  userName: string,
  courseName: string,
  couponCode: string,
  amount: number,
  expiresAt: Date
) {
  const mypageUrl = `${process.env.NEXTAUTH_URL}/mypage/coupons`;
  const formattedAmount = amount.toLocaleString();
  const formattedExpiry = expiresAt.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || '셀러노트 <onboarding@resend.dev>',
      to: email,
      subject: `[셀러노트] 수강 완료 기념 ${formattedAmount}원 할인 쿠폰이 발급되었습니다!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #6AAF50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">셀러노트</h1>
              <p style="color: #E8F5E3; margin: 10px 0 0; font-size: 14px;">수강 완료 축하 쿠폰</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">
                ${userName}님, 축하드립니다! 🎉
              </h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                <strong style="color: #6AAF50;">${courseName}</strong> 과정을 성공적으로 완료하셨습니다!<br><br>
                수강 완료 기념으로 다음 강의 수강 시 사용하실 수 있는<br>
                특별 할인 쿠폰을 발급해 드립니다.
              </p>

              <div style="background-color: #F5FAF3; border: 2px dashed #6AAF50; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">쿠폰 코드</p>
                <p style="color: #1f2937; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0 0 16px;">${couponCode}</p>
                <p style="color: #6AAF50; font-size: 24px; font-weight: bold; margin: 0;">${formattedAmount}원 할인</p>
              </div>

              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.8;">
                  <strong>쿠폰 안내</strong><br>
                  • 유효기간: <strong>${formattedExpiry}</strong>까지<br>
                  • 본인 또는 지인에게 선물 가능<br>
                  • 모든 강의에 사용 가능
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${mypageUrl}" style="display: inline-block; background-color: #6AAF50; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">
                  내 쿠폰 확인하기
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
                앞으로도 셀러노트와 함께 성장하는 여정을 응원합니다!
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                본 메일은 수강 완료 시 자동 발송되는 메일입니다.<br>
                문의사항은 고객센터로 연락해주세요.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send coupon email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
