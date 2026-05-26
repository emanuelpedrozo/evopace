export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

let externalAdd: ((message: string, variant: ToastVariant) => void) | null = null

export const toast = {
  success: (message: string) => externalAdd?.(message, 'success'),
  error: (message: string) => externalAdd?.(message, 'error'),
  info: (message: string) => externalAdd?.(message, 'info'),
  warning: (message: string) => externalAdd?.(message, 'warning'),
}

export function registerToastHandler(handler: (message: string, variant: ToastVariant) => void) {
  externalAdd = handler
}

export function unregisterToastHandler() {
  externalAdd = null
}
