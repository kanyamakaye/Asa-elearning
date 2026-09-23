import { useEffect, useRef, useState } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// google-login.md — renders Google's own "Sign in with Google" button via
// Google Identity Services (the <script> tag loaded in index.html), and
// hands the signed ID token it returns up to the caller. Renders nothing if
// no client ID is configured, so the feature stays invisible until set up.
export default function GoogleSignInButton({ onCredential, text = 'continue_with' }) {
  const buttonRef = useRef(null)
  const [scriptReady, setScriptReady] = useState(typeof window !== 'undefined' && Boolean(window.google?.accounts?.id))

  useEffect(() => {
    if (!CLIENT_ID || scriptReady) return undefined
    // The GIS <script> in index.html is async/defer, so it may still be
    // loading when this component first mounts — poll briefly rather than
    // assuming it's already there.
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [scriptReady])

  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || !buttonRef.current) return
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => onCredential(response.credential),
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 336,
      text,
    })
  }, [scriptReady, onCredential, text])

  if (!CLIENT_ID) return null

  return <div ref={buttonRef} className="flex justify-center" />
}
