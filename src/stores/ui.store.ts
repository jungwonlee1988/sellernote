import { create } from 'zustand'
import type { ToastData, ToastType } from '@/components/ui/Toast'

interface ModalState {
  isOpen: boolean
  title?: string
  description?: string
  content?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

interface UIState {
  toasts: ToastData[]
  modal: ModalState
  isSidebarOpen: boolean
  isLoading: boolean
  loadingText: string | null
}

interface UIActions {
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  openModal: (options: Omit<ModalState, 'isOpen'>) => void
  closeModal: () => void

  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void

  setLoading: (isLoading: boolean, text?: string | null) => void
}

type UIStore = UIState & UIActions

let toastId = 0

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  modal: { isOpen: false },
  isSidebarOpen: false,
  isLoading: false,
  loadingText: null,

  addToast: (type, message, duration = 5000) => {
    const id = `toast-${++toastId}`
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }))
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  openModal: (options) => {
    set({ modal: { ...options, isOpen: true } })
  },

  closeModal: () => {
    set({ modal: { isOpen: false } })
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen })
  },

  setLoading: (isLoading, text = null) => {
    set({ isLoading, loadingText: text })
  },
}))

export const toast = {
  success: (message: string, duration?: number) => {
    useUIStore.getState().addToast('success', message, duration)
  },
  error: (message: string, duration?: number) => {
    useUIStore.getState().addToast('error', message, duration)
  },
  warning: (message: string, duration?: number) => {
    useUIStore.getState().addToast('warning', message, duration)
  },
  info: (message: string, duration?: number) => {
    useUIStore.getState().addToast('info', message, duration)
  },
}
