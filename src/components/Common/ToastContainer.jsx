import useToastStore from '../../stores/toastStore'

const STYLES = {
  success: {
    box: 'bg-green-50 border-green-200 text-green-800',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-green-600 shrink-0">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.6-4.2-4.2 1.4-1.4 2.8 2.8 6-6 1.4 1.4z" />
      </svg>
    ),
  },
  error: {
    box: 'bg-red-50 border-red-200 text-red-800',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-red-600 shrink-0">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z" />
      </svg>
    ),
  },
  warning: {
    box: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-amber-600 shrink-0">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z" />
      </svg>
    ),
  },
  info: {
    box: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-600 shrink-0">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z" />
      </svg>
    ),
  },
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => {
        const style = STYLES[t.type] ?? STYLES.info
        return (
          <div
            key={t.id}
            role="alert"
            className={`flex items-start gap-2.5 border rounded-xl shadow-md px-4 py-3 text-sm ${style.box}`}
          >
            {style.icon}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
