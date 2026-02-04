import * as postmark from 'postmark'

// Lazy initialization to avoid build-time errors
let client: postmark.ServerClient | null = null
let cachedApiKey: string | null = null

function getPostmarkClient(): postmark.ServerClient {
  const apiKey = process.env.POSTMARK_API_KEY || ''

  // Recreate client if API key changed (or was not set initially)
  if (!client || cachedApiKey !== apiKey) {
    client = new postmark.ServerClient(apiKey)
    cachedApiKey = apiKey
  }
  return client
}

const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@seller-note.com'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  data?: postmark.Models.MessageSendingResponse
  error?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const response = await getPostmarkClient().sendEmail({
      From: fromEmail,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
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
