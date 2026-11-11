import { useEffect, useId, useRef, useState } from 'react'
import logoMark from '../assets/logo-mark.png'
import { jobs } from '../data/jobs.ts'
import { defaultFilters, matchesFilters } from '../lib/jobs.ts'
import { useOnboarding, type Profile, type Seniority } from '../onboarding.ts'

/** Roughly how long one status line stays up */
const STEP_MS = 920

const seniorityWords: Record<Seniority, string> = {
  entry: 'entry-level',
  mid: 'mid-level',
  senior: 'senior',
  lead: 'lead',
}

/** What the agent says it's doing, built from the user's own answers */
function statusLines(profile: Profile) {
  const roles = profile.roles.slice(0, 2).join(' and ')
  const city = profile.location?.name
  const matches = jobs.filter((job) => matchesFilters(job, defaultFilters)).length
  return [
    roles ? `Looking for open ${roles} roles` : 'Looking for open roles for you',
    city ? `Checking who’s hiring in ${city}` : 'Checking who’s hiring',
    profile.seniority
      ? `Matching roles to your ${seniorityWords[profile.seniority]} experience`
      : 'Matching roles to your experience',
    ...(profile.needsVisa ? ['Checking which employers sponsor visas'] : []),
    `Ranking your ${matches} matches`,
    'Personalizing your job board',
  ]
}

/** The pause between onboarding and the job board, as the real product would take it */
export function FindingMatches() {
  const { account, profile, goTo } = useOnboarding()
  const headingId = useId()
  const [lines] = useState(() => statusLines(profile))
  const [startedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const finished = useRef(false)
  const duration = lines.length * STEP_MS

  useEffect(() => {
    // Time from a fixed start, so re-running this effect never restarts the sequence
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 100)
    return () => window.clearInterval(timer)
  }, [startedAt])

  useEffect(() => {
    // Once only: this card keeps ticking while it fades out over the board
    if (elapsed < duration || finished.current) return
    finished.current = true
    goTo('dashboard')
  }, [elapsed, duration, goTo])

  const index = Math.min(lines.length - 1, Math.floor(elapsed / STEP_MS))
  const firstName = account.firstName.trim()

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full max-w-152.5 flex-col items-center rounded-3xl bg-white px-6 py-12 text-center shadow-2xl sm:px-12 sm:py-16"
    >
      {/* The logo file is navy on white; these filters turn it black, as in the app's sidebar */}
      <img
        src={logoMark}
        alt=""
        className="w-11 animate-plane-float mix-blend-multiply contrast-[3] grayscale motion-reduce:animate-none"
      />
      <h1
        id={headingId}
        className="mt-8 font-display text-[2.125rem] leading-[2.375rem] font-light tracking-[-0.04em] sm:text-[2.6875rem] sm:leading-[2.8125rem]"
      >
        Finding your matches{firstName ? `, ${firstName}` : ''}
      </h1>
      <p aria-live="polite" className="mt-4 min-h-[2lh] max-w-96 text-body text-subtle">
        <span key={index} className="inline-block animate-status-in motion-reduce:animate-none">
          {lines[index]}…
        </span>
      </p>
      <div aria-hidden="true" className="mt-6 h-1.5 w-full max-w-60 overflow-hidden rounded-full bg-track">
        <div
          className="h-full origin-left animate-loader-fill rounded-full bg-ink"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </section>
  )
}
