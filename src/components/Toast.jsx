import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ToastContext from '../contexts/ToastContext'

let idCounter = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((opts) => {
    const id = idCounter++
    const toast = {
      id,
      title: opts.title || '',
      description: opts.description || '',
      variant: opts.variant || 'info', // 'info' | 'success' | 'error'
      duration: typeof opts.duration === 'number' ? opts.duration : 5000
    }
    // deduplicate toasts with same title+description+variant
    setToasts((prev) => {
      const exists = prev.find((x) => x.title === toast.title && x.description === toast.description && x.variant === toast.variant)
      if (exists) {
        // move existing toast to top and reset duration by replacing it
        const filtered = prev.filter((x) => x !== exists)
        return [ { ...exists, id: exists.id, duration: toast.duration }, ...filtered ]
      }
      return [toast, ...prev]
    })
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const ctx = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div aria-live="polite" className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl px-4">
          <div className="space-y-3">
            {toasts.map((t) => (
              <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onDismiss }) {
  const { title, description, variant, duration } = toast
  useEffect(() => {
    if (!duration) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  const base = 'pointer-events-auto rounded-lg shadow-lg ring-1 ring-black/5 px-4 py-3 flex items-start gap-3'
  const variants = {
    info: 'bg-white text-slate-900',
    success: 'bg-emerald-50 text-emerald-900',
    error: 'bg-red-50 text-red-900'
  }

  return (
    <div className={`${base} ${variants[variant] || variants.info}`}>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button onClick={onDismiss} className="text-sm opacity-80 hover:opacity-100 rounded p-1" aria-label="Dismiss notification">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default ToastProvider
