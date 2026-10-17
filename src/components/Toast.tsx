import { useEffect, useRef, useState } from 'react'
import './Toast.css'

export type ToastData = {
  /** Changes for every new toast so the timer restarts. */
  id: number
  message: string
  action?: { label: string; onAction: () => void }
}

type Props = {
  toast: ToastData | null
  onDismiss: () => void
  /** How long it stays up; paused while hovered or focused. */
  duration?: number
}

/** A short-lived message with an optional action (Undo). Announced politely. */
export default function Toast({ toast, onDismiss, duration = 6000 }: Props) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(duration)
  const startedAt = useRef(0)

  useEffect(() => {
    remaining.current = duration
  }, [toast?.id, duration])

  useEffect(() => {
    if (!toast || paused) return
    startedAt.current = Date.now()
    const timer = window.setTimeout(onDismiss, remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current -= Date.now() - startedAt.current
    }
  }, [toast, paused, onDismiss])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div
          className="toast"
          key={toast.id}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <p className="toast-message">{toast.message}</p>
          {toast.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                toast.action!.onAction()
                onDismiss()
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
