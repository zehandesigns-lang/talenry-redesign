import { Check, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { GoogleIcon } from '../components/icons.tsx'
import { SetupCard } from '../components/SetupCard.tsx'
import { Brand } from '../components/Sidebar.tsx'
import { focusRing, inputClass } from '../components/styles.ts'
import { TextField } from '../components/TextField.tsx'
import { track } from '../lib/analytics.ts'
import { useOnboarding, type Account } from '../onboarding.ts'

/** What the mock Google sign-in hands back; a null photo shows the mock profile photo */
const googleAccount: Account = { firstName: 'Zehan', lastName: 'Modan', photo: null }

/** Long enough to read as a round trip to Google */
const GOOGLE_SIGN_IN_MS = 1100

const linkClass = 'font-medium text-link'

/**
 * The first screen of onboarding. The whole form is drawn, but in the prototype only Google
 * sign-in moves on; the other controls point back to it.
 */
export function SignUp() {
  const { updateAccount, goTo } = useOnboarding()
  const [connecting, setConnecting] = useState(false)
  const [nudges, setNudges] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const googleButton = useRef<HTMLButtonElement>(null)
  const signInTimer = useRef<number | undefined>(undefined)
  const viewLogged = useRef(false)
  const noteId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (viewLogged.current) return // StrictMode runs effects twice in development
    viewLogged.current = true
    track('signup_viewed')
  }, [])

  useEffect(() => {
    const timer = signInTimer
    return () => window.clearTimeout(timer.current)
  }, [])

  function continueWithGoogle() {
    if (connecting) return
    setConnecting(true)
    track('signup_google_clicked')
    signInTimer.current = window.setTimeout(() => {
      updateAccount(googleAccount)
      track('signup_completed', { method: 'google' })
      goTo('account')
    }, GOOGLE_SIGN_IN_MS)
  }

  /** Anything else on the form: point at the Google button instead of doing nothing */
  function nudge() {
    setNudges((n) => n + 1)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    googleButton.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    nudge()
  }

  return (
    <SetupCard title="Create an Account" logo={<Brand className="text-[2rem] sm:text-[2.5rem]" />}>
      <div className="relative mt-8 sm:mt-10">
        <button
          ref={googleButton}
          type="button"
          onClick={continueWithGoogle}
          disabled={connecting}
          aria-describedby={noteId}
          className={`flex h-15.75 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 text-body font-medium transition-colors hover:bg-track disabled:cursor-wait ${focusRing}`}
        >
          {connecting ? (
            <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-subtle motion-reduce:animate-none" />
          ) : (
            <GoogleIcon className="size-6" />
          )}
          {connecting ? 'Connecting to Google…' : 'Continue with Google'}
        </button>
        {nudges > 0 && (
          <span
            key={nudges}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-nudge rounded-lg motion-reduce:hidden"
          />
        )}
      </div>
      <p id={noteId} className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-detail text-subtle">
        <span className="rounded-full bg-ink px-2 py-0.5 text-caption font-medium text-white">Prototype</span>
        Only Continue with Google works here.
      </p>

      <p className="mt-7 mb-8 flex items-center gap-4 text-caption tracking-[0.08em] text-subtle">
        <span aria-hidden="true" className="h-px flex-1 bg-chip-line" />
        OR
        <span aria-hidden="true" className="h-px flex-1 bg-chip-line" />
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField label="First name" placeholder="John" autoComplete="given-name" />
          <TextField label="Last name" placeholder="Doe" autoComplete="family-name" />
        </div>
        <TextField
          label="Email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          className="mt-6"
        />
        <div className="mt-6">
          <label htmlFor={passwordId} className="block text-body">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={`absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-md text-subtle transition-colors hover:text-ink ${focusRing}`}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
              ) : (
                <Eye aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        <label className="mt-6 flex items-start gap-3 text-body text-nav">
          <span className="relative mt-0.5 grid size-5.5 shrink-0 place-items-center">
            <input
              type="checkbox"
              className={`peer size-full appearance-none rounded-md border border-[#757775] bg-white transition-colors checked:border-ink checked:bg-ink ${focusRing}`}
            />
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100"
            />
          </span>
          <span>
            I agree to the <span className={linkClass}>Terms of Service</span>,{' '}
            <span className={linkClass}>Privacy Policy</span> and <span className={linkClass}>Cookie Policy</span>.
          </span>
        </label>

        <button
          type="submit"
          aria-describedby={noteId}
          className={`mt-8 w-full rounded-xl bg-ink px-6 py-5 text-action font-medium text-white transition-colors hover:bg-neutral-800 sm:mt-10 ${focusRing}`}
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-body text-nav sm:mt-8">
        Already have an account?{' '}
        <button type="button" onClick={nudge} className={`rounded font-semibold text-link ${focusRing}`}>
          Sign In
        </button>
      </p>

      {/* The trailing space alternates so a repeat nudge is announced again */}
      <p aria-live="polite" className="sr-only">
        {nudges > 0 ? `In this prototype, only Continue with Google works.${nudges % 2 ? '' : ' '}` : ''}
      </p>
    </SetupCard>
  )
}
