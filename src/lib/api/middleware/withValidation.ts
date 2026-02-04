import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ValidationError } from '../errors'
import { errorResponse } from '../response'

interface ValidatedRequest<T> extends NextRequest {
  validatedBody: T
}

type RouteHandler<TBody, TResponse = unknown> = (
  request: ValidatedRequest<TBody>,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<TResponse>>

export function withValidation<TBody, TResponse = unknown>(
  schema: z.ZodSchema<TBody>,
  handler: RouteHandler<TBody, TResponse>
) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse<TResponse>> => {
    try {
      const body = await request.json()
      const validatedBody = schema.parse(body)

      const validatedRequest = request as ValidatedRequest<TBody>
      validatedRequest.validatedBody = validatedBody

      return handler(validatedRequest, context)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0]
        const message = firstIssue?.message || '입력값이 올바르지 않습니다.'
        return errorResponse(new ValidationError(message)) as NextResponse<TResponse>
      }

      if (error instanceof SyntaxError) {
        return errorResponse(new ValidationError('올바른 JSON 형식이 아닙니다.')) as NextResponse<TResponse>
      }

      return errorResponse(error) as NextResponse<TResponse>
    }
  }
}

export function withQueryValidation<TQuery, TResponse = unknown>(
  schema: z.ZodSchema<TQuery>,
  handler: (
    request: NextRequest & { validatedQuery: TQuery },
    context?: { params: Promise<Record<string, string>> }
  ) => Promise<NextResponse<TResponse>>
) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse<TResponse>> => {
    try {
      const url = new URL(request.url)
      const queryParams = Object.fromEntries(url.searchParams.entries())
      const validatedQuery = schema.parse(queryParams)

      const validatedRequest = request as NextRequest & { validatedQuery: TQuery }
      validatedRequest.validatedQuery = validatedQuery

      return handler(validatedRequest, context)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0]
        const message = firstIssue?.message || '쿼리 파라미터가 올바르지 않습니다.'
        return errorResponse(new ValidationError(message)) as NextResponse<TResponse>
      }

      return errorResponse(error) as NextResponse<TResponse>
    }
  }
}

export type { ValidatedRequest }
