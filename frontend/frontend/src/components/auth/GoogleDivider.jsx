// Shared "or" divider between the password form and GoogleSignInButton on
// Login/Register. Hides itself under the same condition GoogleSignInButton
// does, so an unconfigured Google Sign-In never leaves a dangling "or" with
// nothing below it.
export default function GoogleDivider() {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null

  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-navy-900/8" />
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-700/40">or</span>
      <div className="h-px flex-1 bg-navy-900/8" />
    </div>
  )
}
