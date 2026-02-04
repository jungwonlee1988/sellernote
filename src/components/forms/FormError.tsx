'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormErrorProps {
  message?: string | null
  className?: string
}

function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm whitespace-pre-line">{message}</p>
    </div>
  )
}

interface FormSuccessProps {
  message?: string | null
  className?: string
}

function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600',
        className
      )}
      role="status"
    >
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}

export { FormError, FormSuccess }
