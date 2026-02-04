'use client'

import { useUIStore } from '@/stores'

export function useToast() {
  const { toasts, addToast, removeToast, clearToasts } = useUIStore()

  return {
    toasts,
    removeToast,
    clearToasts,
    toast: {
      success: (message: string, duration?: number) => addToast('success', message, duration),
      error: (message: string, duration?: number) => addToast('error', message, duration),
      warning: (message: string, duration?: number) => addToast('warning', message, duration),
      info: (message: string, duration?: number) => addToast('info', message, duration),
    },
  }
}
