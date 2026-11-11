import { Check, ChevronDown, Copy, FileText, LoaderCircle, MailCheck } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CompanyLogo } from '../components/CompanyLogo.tsx'
import { GoogleIcon } from '../components/icons.tsx'
import { GmailConnectDialog, ProOfferDialog } from '../components/OutreachDialogs.tsx'
import { focusRing } from '../components/styles.ts'
import { companies, jobs } from '../data/jobs.ts'
import { track } from '../lib/analytics.ts'
import { defaultFilters, matchScore, matchesFilters } from '../lib/jobs.ts'
import { outreachEmails, type Attachment, type OutreachEmail } from '../lib/outreach.ts'
import {
  MONTHLY_AUTO_APPLIES,
  PRO_MONTHLY_AUTO_APPLIES,
  autoAppliesLeft,
  nextResetDate,
  useOnboarding,
  type EmailEdit,
} from '../onboarding.ts'

/** Gap between emails in a batch, so each one visibly leaves */
const SEND_MS = 550

type Tab = 'to-send' | 'sent'
type SendMode = 'all' | 'single'
type Batch = { jobIds: string[]; mode: SendMode }
type Status = 'draft' | 'queued' | 'sending' | 'sent'

const fieldClass =
  'block w-full rounded-lg border border-control bg-white px-3.5 text-ui outline-none transition-[border-color,box-shadow] focus:border-ink focus:ring-3 focus:ring-black/8 disabled:bg-track disabled:text-meta'
const outlineButton = `flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-control bg-white px-5 text-ui font-semibold whitespace-nowrap transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white ${focusRing}`
const primaryButton = `flex h-12.5 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-ui font-medium whitespace-nowrap text-white transition-colors hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 ${focusRing}`

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const resetFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function sentLabel(sentAt: number | null) {
  if (sentAt === null) return 'Sent'
  const date = new Date(sentAt)
  return date.toDateString() === new Date().toDateString()
    ? `Sent ${timeFormat.format(date)}`
    : `Sent ${dayFormat.format(date)}`
}

/** The hiring manager's address, selectable as text and copyable in one click */
function RecipientAddress({ email }: { email: string }) {
  const [copied, setCopied] = useState<'done' | 'failed' | null>(null)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied('done')
      track('outreach_address_copied')
    } catch {
      setCopied('failed')
    }
  }

  return (
    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-ui-sm">
      <span className="shrink-0 text-meta">To</span>
      <span title={email} className="min-w-0 truncate font-medium text-nav-active">
        {email}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${email}`}
        className={`grid size-7 shrink-0 place-items-center rounded-md text-meta transition-colors hover:bg-track hover:text-ink ${focusRing}`}
      >
        {copied === 'done' ? (
          <Check aria-hidden="true" strokeWidth={2} className="size-3.5" />
        ) : (
          <Copy aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
        )}
      </button>
      <span aria-live="polite" className="shrink-0 text-meta">
        {copied === 'done' ? 'Copied' : copied === 'failed' ? 'Couldn’t copy' : ''}
      </span>
    </div>
  )
}

function Attachments({ files }: { files: Attachment[] }) {
  return (
    <ul aria-label="Attachments" className="mt-3 flex flex-wrap gap-2">
      {files.map((file) => (
        <li
          key={file.kind}
          title={file.name}
          className="flex max-w-full min-w-0 items-center gap-2.5 rounded-lg border border-chip-line bg-white py-1.5 pr-3 pl-1.5 sm:max-w-80"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-tag">
            <FileText aria-hidden="true" strokeWidth={1.75} className="size-4 text-nav" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-ui-sm font-medium text-nav-active">{file.name}</span>
            <span className="block text-caption text-meta">
              {file.kind === 'resume' ? 'Résumé' : 'Cover letter'} · {file.size}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

type EmailCardProps = {
  email: OutreachEmail
  status: Status
  expanded: boolean
  canSend: boolean
  onToggle: () => void
  onSend: () => void
  onEdit: (edit: EmailEdit) => void
}

function EmailCard({ email, status, expanded, canSend, onToggle, onSend, onEdit }: EmailCardProps) {
  const id = useId()
  const { job, manager } = email
  // The line after "Hi Name," is the most telling one
  const preview = email.body.split('\n\n')[1] ?? email.body
  const locked = status !== 'draft'

  return (
    <article className="py-6 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CompanyLogo company={job.company} className="size-11 sm:size-12" />
          <div className="min-w-0 flex-1">
            <p className="text-ui-sm text-meta">
              {manager.firstName} {manager.lastName} · {manager.title}, {companies[job.company]}
            </p>
            <RecipientAddress email={manager.email} />
            <h2 className="mt-2.5 text-ui-lg font-semibold text-nav-active">{email.subject}</h2>
            {!expanded && <p className="mt-1 line-clamp-2 text-ui text-soft sm:line-clamp-1">{preview}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 max-sm:pl-14">
          {status === 'sent' ? (
            <span className="flex h-11 items-center gap-1.5 rounded-xl bg-tag px-4 text-ui font-semibold text-meta">
              <Check aria-hidden="true" strokeWidth={2} className="size-4" />
              {sentLabel(email.sentAt)}
            </span>
          ) : status === 'sending' ? (
            <span className="flex h-11 items-center gap-2 px-2 text-ui text-nav">
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
              Sending…
            </span>
          ) : status === 'queued' ? (
            <span className="flex h-11 items-center px-2 text-ui text-soft">Queued</span>
          ) : (
            <button type="button" onClick={onSend} disabled={!canSend} className={outlineButton}>
              Send
            </button>
          )}
        </div>
      </div>

      {/* Lines up with the text beside the logo */}
      <div className="pl-14 sm:pl-15">
        {expanded && (
          <div id={`${id}-email`} className="mt-5 flex flex-col gap-3">
            <label className="block">
              <span className="text-ui-sm text-meta">Subject</span>
              <input
                value={email.subject}
                disabled={locked}
                onChange={(event) => onEdit({ subject: event.target.value, body: email.body })}
                className={`mt-1.5 h-11 ${fieldClass}`}
              />
            </label>
            <label className="block">
              <span className="text-ui-sm text-meta">Email</span>
              <textarea
                value={email.body}
                disabled={locked}
                rows={12}
                onChange={(event) => onEdit({ subject: email.subject, body: event.target.value })}
                className={`mt-1.5 resize-y py-3 leading-relaxed ${fieldClass}`}
              />
            </label>
          </div>
        )}
        <Attachments files={email.attachments} />
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-email`}
          onClick={onToggle}
          className={`mt-3 flex items-center gap-1.5 rounded-md text-ui-sm font-semibold text-nav hover:text-ink ${focusRing}`}
        >
          {expanded ? 'Hide email' : locked ? 'Read email' : 'Read and edit'}
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </article>
  )
}

/** "To send" once everything is out: say so, then point at the most useful next thing to do */
function CaughtUp({ sent, onSeeMatches, onSeePro }: { sent: number; onSeeMatches: () => void; onSeePro: () => void }) {
  const { profile, appliedJobIds, autoApplies } = useOnboarding()
  const headingId = useId()
  const waiting = jobs.filter((job) => matchesFilters(job, defaultFilters) && !appliedJobIds.includes(job.id))
  const strong = waiting.filter((job) => matchScore(job, profile) > 85).length
  const left = autoAppliesLeft(autoApplies)

  const detail =
    waiting.length === 0
      ? 'You’ve applied to every current match. Widen your filters and I’ll find more.'
      : `${waiting.length} ${waiting.length === 1 ? 'match is' : 'matches are'} still waiting${
          strong ? `, ${strong} of them above 85%` : ''
        }. ${
          left > 0
            ? `You have ${left} auto-applies left this month.`
            : `Your ${MONTHLY_AUTO_APPLIES} auto-applies come back on ${resetFormat.format(nextResetDate())}, or Pro gives you ${PRO_MONTHLY_AUTO_APPLIES} a month.`
        }`

  return (
    <div className="pt-8 pb-4">
      <div className="flex items-start gap-3.5 sm:px-1.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-tag">
          <MailCheck aria-hidden="true" strokeWidth={1.75} className="size-5 text-nav" />
        </span>
        <div>
          <h2 className="text-ui-lg font-semibold text-nav-active">You’re all caught up</h2>
          <p className="mt-1 text-ui text-soft">
            All {sent} {sent === 1 ? 'email is' : 'emails are'} out. Replies can take a few days, and they’ll show up
            under Sent.
          </p>
        </div>
      </div>

      <section aria-labelledby={headingId} className="mt-8 rounded-2xl border border-chip-line bg-sidebar p-6 sm:p-8">
        <p className="font-mono text-caption tracking-[0.14em] text-meta uppercase">Suggested next step</p>
        <h3
          id={headingId}
          className="mt-3 font-display text-[1.75rem] leading-tight font-light tracking-[-0.02em] sm:text-[2.125rem]"
        >
          {waiting.length ? 'Line up your next applications' : 'Find more roles'}
        </h3>
        <p className="mt-2 max-w-150 text-ui text-nav">{detail}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onSeeMatches} className={primaryButton}>
            {waiting.length ? 'See my matches' : 'Go to Jobs Directory'}
          </button>
          {waiting.length > 0 && left === 0 && (
            <button type="button" onClick={onSeePro} className={`${outlineButton} h-12.5`}>
              See what Pro adds
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * Emails to the hiring manager of every job the agent applied to, already written, each with the
 * résumé and a cover letter. Send them all at once or one by one once Gmail is connected; sent ones
 * move to the Sent tab.
 */
export function Outreach() {
  const state = useOnboarding()
  const { outreach, updateOutreach, editEmail, markEmailsSent, setPage } = state
  const id = useId()
  const emails = outreachEmails(state)
  const unsent = emails.filter((email) => !email.sent)
  const sentEmails = emails.filter((email) => email.sent)
  const [tab, setTab] = useState<Tab>(() => (unsent.length === 0 && sentEmails.length > 0 ? 'sent' : 'to-send'))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [batch, setBatch] = useState<Batch | null>(null)
  /** Sends waiting on the Gmail connection; an empty list means the user is connecting ahead of time */
  const [awaitingGmail, setAwaitingGmail] = useState<{ jobIds: string[]; mode: SendMode } | null>(null)
  const [sentThisVisit, setSentThisVisit] = useState(false)
  const [proOfferOpen, setProOfferOpen] = useState(false)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ 'to-send': null, sent: null })
  /** When the current batch started; each email in it leaves at a fixed offset from this */
  const batchStartedAt = useRef<number | null>(null)
  const viewLogged = useRef(false)

  const inFlight = batch?.jobIds.filter((jobId) => !outreach.sentJobIds.includes(jobId)) ?? []
  const sending = inFlight.length > 0
  const allSent = emails.length > 0 && unsent.length === 0
  // A batch stays in "To send" until it finishes, so each email can be seen leaving
  const toSend = emails.filter((email) => !email.sent || batch?.jobIds.includes(email.job.id))

  useEffect(() => {
    if (viewLogged.current) return // StrictMode runs effects twice in development
    viewLogged.current = true
    track('outreach_viewed', { drafts: unsent.length })
  }, [unsent.length])

  // Each email in a batch leaves at a fixed time from the start, so re-renders never hold one back.
  // Once the last one is out, the batch clears from "To send", and if nothing is left, Sent opens.
  useEffect(() => {
    if (!batch) return
    batchStartedAt.current ??= Date.now()
    const index = batch.jobIds.findIndex((jobId) => !outreach.sentJobIds.includes(jobId))
    if (index === -1) {
      const remaining = unsent.length
      const timer = window.setTimeout(() => {
        batchStartedAt.current = null
        setBatch(null)
        if (remaining === 0) setTab('sent')
      }, 700)
      return () => window.clearTimeout(timer)
    }
    const due = batchStartedAt.current + (index + 1) * SEND_MS
    const timer = window.setTimeout(() => markEmailsSent([batch.jobIds[index]]), Math.max(0, due - Date.now()))
    return () => window.clearTimeout(timer)
  }, [batch, outreach.sentJobIds, unsent.length, markEmailsSent])

  // With everything sent (in this visit), make the Pro pitch, once
  useEffect(() => {
    if (!allSent || batch || !sentThisVisit || outreach.proOfferSeen) return
    const timer = window.setTimeout(() => {
      setProOfferOpen(true)
      updateOutreach({ proOfferSeen: true })
      track('pro_offer_shown')
    }, 900)
    return () => window.clearTimeout(timer)
  }, [allSent, batch, sentThisVisit, outreach.proOfferSeen, updateOutreach])

  function startSending(jobIds: string[], mode: SendMode) {
    setBatch({ jobIds, mode })
    setSentThisVisit(true)
    track('outreach_sent', { count: jobIds.length, mode })
  }

  function send(jobIds: string[], mode: SendMode) {
    if (!jobIds.length || sending) return
    if (!outreach.gmailConnected) setAwaitingGmail({ jobIds, mode })
    else startSending(jobIds, mode)
  }

  function statusOf(email: OutreachEmail): Status {
    if (email.sent) return 'sent'
    if (inFlight[0] === email.job.id) return 'sending'
    return inFlight.includes(email.job.id) ? 'queued' : 'draft'
  }

  function selectTab(next: Tab) {
    setTab(next)
    setExpanded(null)
  }

  // Arrow keys move between the two tabs, as in any tab list
  function handleTabKeyDown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = tab === 'to-send' ? 'sent' : 'to-send'
    selectTab(next)
    tabRefs.current[next]?.focus()
  }

  const renderList = (list: OutreachEmail[]) => (
    <ul>
      {list.map((email) => (
        <li key={email.job.id} className="border-b border-divider last:border-b-0">
          <EmailCard
            email={email}
            status={statusOf(email)}
            expanded={expanded === email.job.id}
            canSend={!sending}
            onToggle={() => setExpanded((open) => (open === email.job.id ? null : email.job.id))}
            onSend={() => send([email.job.id], 'single')}
            onEdit={(edit) => editEmail(email.job.id, edit)}
          />
        </li>
      ))}
    </ul>
  )

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'to-send', label: 'To send', count: unsent.length },
    { key: 'sent', label: 'Sent', count: sentEmails.length },
  ]
  const plural = (n: number) => `${n} ${n === 1 ? 'email' : 'emails'}`

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-1.5">
        <h1 className="font-display text-[2rem] leading-none font-light sm:text-[2.375rem]">Outreach</h1>
        {tab === 'to-send' && unsent.length > 0 && (
          <button
            type="button"
            onClick={() => send(unsent.map((email) => email.job.id), 'all')}
            disabled={sending}
            className={primaryButton}
          >
            {sending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {sending ? `Sending ${inFlight.length}…` : unsent.length === 1 ? 'Send it' : `Send all ${unsent.length}`}
          </button>
        )}
      </header>
      <p className="mt-2.5 max-w-150 text-ui-sm text-soft sm:px-1.5">
        {emails.length === 0
          ? 'When I apply to jobs for you, I’ll write to each hiring manager here.'
          : 'I wrote to the hiring manager of every job I applied to, with your résumé and a cover letter attached. Send them together or one at a time.'}
      </p>

      {emails.length === 0 ? (
        <div className="py-20 text-center">
          <button
            type="button"
            onClick={() => setPage('jobs')}
            className={`rounded-md text-ui font-semibold underline underline-offset-4 ${focusRing}`}
          >
            Find jobs to apply to
          </button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Outreach emails" className="mt-6 flex gap-7 border-b border-divider sm:px-1.5">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                ref={(element) => {
                  tabRefs.current[key] = element
                }}
                type="button"
                role="tab"
                id={`${id}-${key}-tab`}
                aria-selected={tab === key}
                aria-controls={`${id}-${key}-panel`}
                tabIndex={tab === key ? 0 : -1}
                onClick={() => selectTab(key)}
                onKeyDown={handleTabKeyDown}
                className={`-mb-px flex items-center gap-2 rounded-t-md border-b-2 pt-1 pb-3 text-ui font-semibold transition-colors ${focusRing} ${
                  tab === key ? 'border-ink text-ink' : 'border-transparent text-meta hover:text-ink'
                }`}
              >
                {label}
                <span
                  className={`min-w-6 rounded-full px-2 py-0.5 text-center text-caption leading-none font-semibold ${
                    tab === key ? 'bg-ink text-white' : 'bg-tag text-meta'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${id}-${tab}-panel`} aria-labelledby={`${id}-${tab}-tab`}>
            {tab === 'to-send' ? (
              toSend.length > 0 ? (
                <>
                  <div className="mt-6 flex flex-col gap-3 rounded-xl border border-chip-line bg-sidebar px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="flex items-center gap-3 text-ui text-nav">
                      <GoogleIcon className="size-5 shrink-0" />
                      {outreach.gmailConnected
                        ? 'Sending from your Gmail'
                        : 'Connect Gmail to send these from your own address'}
                    </p>
                    {outreach.gmailConnected ? (
                      <span className="flex items-center gap-1.5 text-ui-sm font-semibold text-meta max-sm:pl-8">
                        <Check aria-hidden="true" strokeWidth={2} className="size-4" />
                        Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAwaitingGmail({ jobIds: [], mode: 'all' })}
                        className={`${outlineButton} h-10 max-sm:ml-8 max-sm:self-start`}
                      >
                        Connect Gmail
                      </button>
                    )}
                  </div>
                  <div className="mt-2">{renderList(toSend)}</div>
                </>
              ) : (
                <CaughtUp
                  sent={sentEmails.length}
                  onSeeMatches={() => {
                    track('outreach_next_step', { action: 'matches' })
                    setPage('jobs')
                  }}
                  onSeePro={() => {
                    track('outreach_next_step', { action: 'pro' })
                    setProOfferOpen(true)
                  }}
                />
              )
            ) : sentEmails.length > 0 ? (
              <div className="mt-2">{renderList(sentEmails)}</div>
            ) : (
              <p className="py-16 text-center text-ui text-soft">Nothing sent yet. Emails you send will show up here.</p>
            )}
          </div>
        </>
      )}

      {/* Announces progress for screen readers; the list shows it visually */}
      <p aria-live="polite" className="sr-only">
        {sending ? `Sending ${plural(inFlight.length)}` : allSent ? `All ${plural(emails.length)} sent` : ''}
      </p>

      {awaitingGmail && (
        <GmailConnectDialog
          emails={awaitingGmail.jobIds.length}
          onClose={() => setAwaitingGmail(null)}
          onConnected={() => {
            updateOutreach({ gmailConnected: true })
            if (awaitingGmail.jobIds.length) startSending(awaitingGmail.jobIds, awaitingGmail.mode)
            setAwaitingGmail(null)
          }}
        />
      )}
      {proOfferOpen && <ProOfferDialog onClose={() => setProOfferOpen(false)} />}
    </>
  )
}
