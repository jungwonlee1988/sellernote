import { NextResponse } from 'next/server'
import { ApiError } from './errors'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiListResponse<T> {
  success: true
  data: T[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function createdResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, 201)
}

export function listResponse<T>(
  items: T[],
  pagination?: {
    total: number
    page: number
    limit: number
  }
): NextResponse<ApiListResponse<T>> {
  const response: ApiListResponse<T> = {
    success: true,
    data: items,
  }

  if (pagination) {
    response.pagination = {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    }
  }

  return NextResponse.json(response)
}

export function errorResponse(error: ApiError | Error | unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '서버 오류가 발생했습니다.',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    )
  }

  console.error('Unknown error:', error)
  return NextResponse.json(
    {
      success: false,
      error: {
        message: '알 수 없는 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  )
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
