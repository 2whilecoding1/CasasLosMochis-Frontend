import { useEffect, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

let googleScriptPromise = null

function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-identity-script')
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID || disabled) return
    let cancelled = false

    loadGoogleScript().then(() => {
      if (cancelled || !window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale: 'es',
      })
    })

    return () => {
      cancelled = true
    }
  }, [onCredential, disabled])

  if (!CLIENT_ID) return null

  return <div ref={buttonRef} className="flex justify-center" />
}
