import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UnauthorizedError, ForbiddenError } from '../errors'
import { errorResponse } from '../response'

type Role = 'USER' | 'ADMIN' | 'INSTRUCTOR'

interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  role: string
}

interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser
}

type RouteContext = { params: Promise<Record<string, string>> }

type RouteHandler = (
  request: AuthenticatedRequest,
  context?: RouteContext
) => Promise<NextResponse>

export function withAuth(handler: RouteHandler) {
  return async (
    request: NextRequest,
    context?: RouteContext
  ): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        throw new UnauthorizedError()
      }

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name,
        role: session.user.role,
      }

      return handler(authenticatedRequest, context)
    } catch (error) {
      return errorResponse(error)
    }
  }
}

export function withRole(roles: Role | Role[], handler: RouteHandler) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  return withAuth(async (request, context) => {
    if (!allowedRoles.includes(request.user.role as Role)) {
      throw new ForbiddenError()
    }
    return handler(request, context)
  })
}

export function withAdmin(handler: RouteHandler) {
  return withRole('ADMIN', handler)
}

export function withInstructor(handler: RouteHandler) {
  return withRole(['ADMIN', 'INSTRUCTOR'], handler)
}

export type { AuthenticatedRequest, AuthenticatedUser, RouteHandler, RouteContext }
