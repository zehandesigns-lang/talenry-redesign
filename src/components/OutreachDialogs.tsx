import { Check, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { track } from '../lib/analytics.ts'
import { FOLLOW_UP_LIFT, FOLLOW_UP_SOURCE, OUTREACH_INTERVIEW_LIFT } from '../lib/outreach.ts'
import { MONTHLY_AUTO_APPLIES, PRO_MONTHLY_AUTO_APPLIES } from '../onboarding.ts'
import { GoogleIcon } from './icons.tsx'
import {
  PromptDialog,
  PrototypeNote,
  StatCallout,
  promptPrimaryButton,
  promptSecondaryButton,
} from './PromptDialog.tsx'
import { focusRing } from './styles.ts'

const actionsRow = 'mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'

/** Shown once the agent has finished applying: the next thing worth doing is emailing the hiring managers */
export function OutreachPrompt({ drafts, onReview, onLater }: { drafts: number; onReview: () => void; onLater: () => void }) {
  const reviewRef = useRef<HTMLButtonElement>(null)

  return (
    <PromptDialog
      eyebrow="Next step"
      title="Let’s finish with outreach"
      description={`Your applications are in. A short, personal email to each hiring manager helps you stand out, so I’ve already written ${
        drafts === 1 ? 'one' : `all ${drafts}`
      }. Nothing is sent until you say so.`}
      onClose={onLater}
      initialFocus={reviewRef}
    >
      <StatCallout figure={OUTREACH_INTERVIEW_LIFT}>
        as likely to land an interview when you also email the hiring manager
      </StatCallout>
      <div className="mt-2.5">
        <PrototypeNote>Illustrative figure, not a measured one</PrototypeNote>
      </div>
      <div className={actionsRow}>
        <button type="button" onClick={onLater} className={promptSecondaryButton}>
          Later
        </button>
        <button ref={reviewRef} type="button" onClick={onReview} className={promptPrimaryButton}>
          Review the emails
        </button>
      </div>
    </PromptDialog>
  )
}

/** Sending needs the user's Gmail; this asks for send-only access before anything goes out */
export function GmailConnectDialog({
  emails,
  onConnected,
  onClose,
}: {
  /** How many emails are waiting on the connection; 0 when connecting ahead of time */
  emails: number
  onConnected: () => void
  onClose: () => void
}) {
  const connectRef = useRef<HTMLButtonElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const pending = timer
    return () => window.clearTimeout(pending.current)
  }, [])

  function connect() {
    setConnecting(true)
    // Mock OAuth round trip
    timer.current = window.setTimeout(() => {
      track('gmail_connected', { waiting: emails })
      onConnected()
    }, 1100)
  }

  const what = emails === 0 ? 'your emails' : emails === 1 ? 'this email' : `these ${emails} emails`

  return (
    <PromptDialog
      eyebrow="Gmail"
      title="Connect Gmail to send"
      description={`I’ll send ${what} from your own address, so replies land in your inbox like any other email.`}
      onClose={onClose}
      initialFocus={connectRef}
    >
      <ul className="mt-6 flex flex-col gap-3.5 rounded-2xl border border-chip-line px-5 py-4.5 text-body">
        <li className="flex items-start gap-3">
          <Check aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0" />
          Send only the emails you approve
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0" />
          Never read, change or delete anything else in your inbox
        </li>
      </ul>
      <div className="mt-3">
        <PrototypeNote>Nothing connects to your real Gmail.</PrototypeNote>
      </div>
      <div className={actionsRow}>
        <button
          type="button"
          onClick={onClose}
          disabled={connecting}
          className={`rounded-xl px-5 py-4.5 text-action font-medium text-meta transition-colors hover:text-ink disabled:opacity-40 ${focusRing}`}
        >
          Not now
        </button>
        <button
          ref={connectRef}
          type="button"
          onClick={connect}
          disabled={connecting}
          className={`flex items-center justify-center gap-3 rounded-xl border border-line bg-white px-6 py-4.5 text-action font-medium whitespace-nowrap transition-colors hover:bg-track disabled:cursor-wait ${focusRing}`}
        >
          {connecting ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-subtle motion-reduce:animate-none" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          {connecting ? 'Connecting to Gmail…' : 'Continue with Google'}
        </button>
      </div>
    </PromptDialog>
  )
}

/** The upgrade pitch once outreach has gone out: what Pro would let the agent do next */
export function ProOfferDialog({ onClose }: { onClose: () => void }) {
  const upgradeRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [upgradeClicked, setUpgradeClicked] = useState(false)
  const multiple = PRO_MONTHLY_AUTO_APPLIES / MONTHLY_AUTO_APPLIES

  // The upgrade button goes away once pressed, so keep focus inside the dialog
  useEffect(() => {
    if (upgradeClicked) closeRef.current?.focus()
  }, [upgradeClicked])

  const perks = [
    {
      key: 'follow-ups',
      text: (
        <>
          I follow up when a hiring manager hasn’t replied in 5 days. One follow-up gets {FOLLOW_UP_LIFT} more
          replies.
          <sup aria-hidden="true">*</sup>
        </>
      ),
    },
    { key: 'resumes', text: 'A tailored résumé for every application' },
    { key: 'interviews', text: 'Unlimited mock interviews before the real ones' },
  ]

  return (
    <PromptDialog
      eyebrow="Pro plan"
      title="Get hired sooner with Pro"
      description="Your emails are on their way. Pro lets me do a lot more for you each month."
      onClose={onClose}
      initialFocus={upgradeRef}
    >
      <StatCallout figure={`${multiple}×`}>
        the auto-applies: {PRO_MONTHLY_AUTO_APPLIES} a month instead of {MONTHLY_AUTO_APPLIES}
      </StatCallout>
      <ul className="mt-5 flex flex-col gap-3 text-body">
        {perks.map((perk) => (
          <li key={perk.key} className="flex items-start gap-3">
            <Check aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0" />
            <span>{perk.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-caption text-subtle">
        * From{' '}
        <a
          href={FOLLOW_UP_SOURCE.url}
          target="_blank"
          rel="noreferrer"
          className={`rounded underline underline-offset-2 hover:text-ink ${focusRing}`}
        >
          {FOLLOW_UP_SOURCE.label}
        </a>
      </p>
      {upgradeClicked ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite">
            <PrototypeNote>Checkout isn’t part of this prototype.</PrototypeNote>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className={promptSecondaryButton}>
            Close
          </button>
        </div>
      ) : (
        <div className={actionsRow}>
          <button
            type="button"
            onClick={() => {
              track('pro_offer_dismissed')
              onClose()
            }}
            className={promptSecondaryButton}
          >
            Stay on Starter
          </button>
          <button
            ref={upgradeRef}
            type="button"
            onClick={() => {
              track('pro_upgrade_clicked')
              setUpgradeClicked(true)
            }}
            className={promptPrimaryButton}
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </PromptDialog>
  )
}
