import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { ConfirmDialogState } from './confirm-dialog-state'

export function ConfirmDialog({
  state,
  onClose,
}: {
  state: ConfirmDialogState
  onClose: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state.open) {
      cancelRef.current?.focus()
    }
  }, [state.open])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && state.open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.open, onClose])

  if (!state.open) return null

  return (
    <div className="dialog-overlay" onClick={onClose} role="presentation">
      <div
        className="dialog-panel"
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-icon">
          <AlertTriangle aria-hidden="true" />
        </div>
        <h3 id="confirm-title">{state.title}</h3>
        <p id="confirm-desc">{state.message}</p>
        <div className="dialog-actions">
          <button
            ref={cancelRef}
            className="secondary-action"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="danger-action"
            type="button"
            onClick={() => {
              state.onConfirm()
              onClose()
            }}
          >
            Confirmar exclusão
          </button>
        </div>
        <button
          className="dialog-close"
          type="button"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
