import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 서버 사이드에서만 사용 (서비스 롤 키 사용)
function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const RECORDING_BUCKET = 'recordings'
export const ASSIGNMENT_BUCKET = 'assignments'

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return data.path
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1시간
): Promise<string> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Signed URL error:', error)
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

export async function listFiles(bucket: string, folder: string) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage.from(bucket).list(folder)

  if (error) {
    console.error('List error:', error)
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseAdmin()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAssignmentFile(
  courseId: string,
  assignmentId: string,
  userId: string,
  fileName: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  const path = `${courseId}/${assignmentId}/${userId}/${fileName}`
  return uploadFile(ASSIGNMENT_BUCKET, path, file, contentType)
}

export async function getRecordingUrl(
  sessionId: string,
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  const path = `${sessionId}/${fileName}`
  return getSignedUrl(RECORDING_BUCKET, path, expiresIn)
}

export function generateRecordingPath(
  courseId: string,
  sessionId: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${courseId}/${sessionId}/recording_${timestamp}.mp4`
}
