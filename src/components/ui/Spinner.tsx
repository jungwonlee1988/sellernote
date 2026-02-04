'use client'

import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  }

  const colors = {
    primary: 'border-[#6AAF50] border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-gray-600',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizes[size],
        colors[color],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  fullScreen?: boolean
}

function LoadingOverlay({
  isLoading,
  text = '로딩 중...',
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
      )}
    >
      <Spinner size="lg" />
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export { Spinner, LoadingOverlay }
