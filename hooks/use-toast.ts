import { useState, useCallback } from 'react'

interface ToastState {
  message: string
  isVisible: boolean
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    isVisible: false,
  })

  const showToast = useCallback((message: string) => {
    setToast({ message, isVisible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }, [])

  return {
    toast,
    showToast,
  }
}
