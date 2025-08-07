/**
 * Notification Composable - Vue Sonner Integration
 * Provides toast notifications and integrates with notifications store
 */

import { toast } from 'vue-sonner'
import type {
  ToastNotification,
  UseNotificationReturn
} from '@/types/notifications'

export function useNotification(): UseNotificationReturn {
  
  const showToast = (notification: ToastNotification) => {
    const { title, message, variant, duration, action } = notification

    const toastOptions = {
      description: message,
      duration: duration || 4000,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    }

    switch (variant) {
      case 'success':
        toast.success(title, toastOptions)
        break
      case 'error':
        toast.error(title, toastOptions)
        break
      case 'warning':
        toast.warning(title, toastOptions)
        break
      case 'info':
      default:
        toast.info(title, toastOptions)
        break
    }
  }

  const success = (title: string, message: string) => {
    showToast({
      title,
      message,
      variant: 'success'
    })
  }

  const error = (title: string, message: string) => {
    showToast({
      title,
      message,
      variant: 'error',
      duration: 6000 // Errors should stay longer
    })
  }

  const warning = (title: string, message: string) => {
    showToast({
      title,
      message,
      variant: 'warning',
      duration: 5000
    })
  }

  const info = (title: string, message: string) => {
    showToast({
      title,
      message,
      variant: 'info'
    })
  }

  return {
    showToast,
    success,
    error,
    warning,
    info
  }
}