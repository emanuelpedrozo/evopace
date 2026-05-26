import { useEffect, useState } from 'react'
import { Check, Info, X, AlertTriangle } from 'lucide-react'
import { registerToastHandler, unregisterToastHandler, type ToastVariant } from './toast-store'

type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

let nextId = 0

const ICONS: Record<ToastVariant, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
}

const AUTO_DISMISS_MS = 4000

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    registerToastHandler((message, variant) => {
      const id = ++nextId
      setItems((current) => [...current, { id, message, variant }])
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id))
      }, AUTO_DISMISS_MS)
    })

    return () => {
      unregisterToastHandler()
    }
  }, [])

  function dismiss(id: number) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  if (!items.length) return null

  return (
    <div className="toast-container" aria-live="polite">
      {items.map((item) => {
        const Icon = ICONS[item.variant]
        return (
          <div key={item.id} className={`toast-item toast-${item.variant}`}>
            <Icon aria-hidden="true" />
            <span>{item.message}</span>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => dismiss(item.id)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
