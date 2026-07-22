import { useState, forwardRef } from 'react'

const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`w-full px-3 pr-11 py-2.5 rounded-lg border border-silver-200 text-sm text-[#1a1a1a]
          placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-silver-500 hover:text-[#1a1a1a] hover:bg-silver-100"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.7 1.43-1.72 2.66-2.96 3.6l1.42 1.42c1.55-1.19 2.82-2.78 3.67-4.62C21.27 7.65 16.97 5 12 5c-1.66 0-3.24.3-4.69.85l1.58 1.58C9.88 6.98 10.92 6 12 6zM2.71 3.57 1.29 5l3.06 3.06C2.83 9.24 1.59 10.95 1 12.5 2.73 16.86 7.03 19.5 12 19.5c1.95 0 3.81-.41 5.49-1.15L19 19.86 20.41 18.45 2.71 3.57zM7.53 11.24l1.55 1.55c-.05.2-.08.41-.08.62a3 3 0 0 0 3 3c.21 0 .42-.03.62-.08l1.55 1.55A4.94 4.94 0 0 1 12 18.5a5 5 0 0 1-5-5c0-.53.08-1.04.23-1.52zm4.31-.73 2.4 2.4.01-.15a3 3 0 0 0-3-3l-.15.01.74.74z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 5c-4.97 0-9.27 2.65-11 7 1.73 4.35 6.03 7 11 7s9.27-2.65 11-7c-1.73-4.35-6.03-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
          </svg>
        )}
      </button>
    </div>
  )
})

export default PasswordInput
