import { Check, ChevronDown, ChevronUp, CircleAlert, CircleCheck, LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { companies, jobs } from '../data/jobs.ts'
import { track } from '../lib/analytics.ts'
import { fillDuration, reviewFor } from '../lib/applying.ts'
import { AUTO_APPLY_COST, useOnboarding, type Application } from '../onboarding.ts'
import { CompanyLogo } from './CompanyLogo.tsx'
import { focusRing } from './styles.ts'

const jobById = new Map(jobs.map((job) => [job.id, job]))

// The brief's run pauses on one or two forms, not every one the agent is unsure about
const MAX_PAUSES_PER_RUN = 2

const iconButton = `grid size-9 shrink-0 place-items-center rounded-lg text-nav transition-colors hover:bg-track ${focusRing}`

/** Works through queued applications one at a time, like the agent filling forms */
function useApplicationRunner() {
  const { applications, applyPanel, updateApplicationStatus } = useOnboarding()

  useEffect(() => {
    const filling = applications.find((a) => a.status === 'filling')
    if (filling) {
      // Absolute timing, so re-running this effect never restarts a form
      const wait = Math.max(0, (filling.startedAt ?? 0) + fillDuration(filling.jobId) - Date.now())
      const timer = window.setTimeout(() => {
        const pausesSoFar = applications.filter(
          (a) => applyPanel.jobIds.includes(a.jobId) && (a.status === 'needs-you' || a.answer !== null),
        ).length
        const unsure =
          filling.answer === null && pausesSoFar < MAX_PAUSES_PER_RUN && reviewFor(filling.jobId) !== null
        updateApplicationStatus(filling.jobId, { status: unsure ? 'needs-you' : 'sent' })
      }, wait)
      return () => window.clearTimeout(timer)
    }
    const next = applications.find((a) => a.status === 'queued')
    if (!next) return
    const timer = window.setTimeout(
      () => updateApplicationStatus(next.jobId, { status: 'filling', startedAt: Date.now() }),
      600,
    )
    return () => window.clearTimeout(timer)
  }, [applications, applyPanel.jobIds, updateApplicationStatus])
}

function StatusLabel({ application, onAnswer }: { application: Application; onAnswer: () => void }) {
  switch (application.status) {
    case 'queued':
      return <span className="shrink-0 text-ui-sm text-soft">Queued</span>
    case 'filling':
      return (
        <span className="flex shrink-0 items-center gap-1.5 text-ui-sm text-nav">
          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
          Filling form
        </span>
      )
    case 'needs-you':
      return (
        <button
          type="button"
          onClick={onAnswer}
          className={`shrink-0 rounded-lg bg-[#fef3c7] px-2.5 py-1 text-ui-sm font-semibold text-[#92400e] transition-colors hover:bg-[#fde68a] ${focusRing}`}
        >
          Answer
        </button>
      )
    case 'sent':
      return (
        <span className="flex shrink-0 items-center gap-1 text-ui-sm text-nav">
          <Check aria-hidden="true" strokeWidth={2} className="size-3.5" />
          Sent
        </span>
      )
  }
}

/** Live status of the current auto-apply run, pinned to the bottom-right corner */
export function ApplyStatusPanel() {
  useApplicationRunner()
  const { applications, applyPanel, credits, setApplyPanel, updateApplicationStatus } = useOnboarding()
  const listId = useId()
  const [answering, setAnswering] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  if (!applyPanel.visible) return null

  const items = applyPanel.jobIds
    .map((id) => applications.find((a) => a.jobId === id))
    .filter((a): a is Application => a !== undefined)
  const total = items.length
  const sent = items.filter((a) => a.status === 'sent').length
  const waiting = items.filter((a) => a.status === 'needs-you').length
  const working = items.some((a) => a.status === 'queued' || a.status === 'filling')
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  const title = working
    ? `Applying to ${plural(total, 'job')}`
    : waiting
      ? `${sent} sent, ${waiting} waiting on you`
      : `${plural(total, 'application')} sent`
  const subtitle = working
    ? `${sent} of ${total} sent${waiting ? ` · ${waiting} ${waiting === 1 ? 'needs' : 'need'} you` : ''}`
    : waiting
      ? 'I paused where I wasn’t sure. Check my drafts.'
      : `${total * AUTO_APPLY_COST} credits used · ${credits} left`

  function send(jobId: string) {
    const answer = drafts[jobId] ?? reviewFor(jobId)?.draft ?? ''
    updateApplicationStatus(jobId, { status: 'filling', startedAt: Date.now(), answer })
    setAnswering(null)
    track('application_answer_sent', { job: jobId })
  }

  return (
    <section
      aria-label="Application progress"
      className="fixed right-4 bottom-4 left-4 z-40 sm:left-auto sm:w-100"
    >
      <div className="overflow-hidden rounded-2xl border border-chip-line bg-white shadow-xl">
        <div className="flex items-center gap-3 px-4 py-3.5">
          {working ? (
            <LoaderCircle aria-hidden="true" className="size-5 shrink-0 animate-spin text-nav" />
          ) : waiting ? (
            <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-[#b45309]" />
          ) : (
            <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-nav-active" />
          )}
          <div aria-live="polite" className="min-w-0 flex-1">
            <p className="truncate text-ui font-semibold">{title}</p>
            <p className="truncate text-ui-sm text-meta">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-expanded={applyPanel.expanded}
            aria-controls={listId}
            aria-label={applyPanel.expanded ? 'Collapse' : 'Expand'}
            onClick={() => setApplyPanel({ expanded: !applyPanel.expanded })}
            className={iconButton}
          >
            {applyPanel.expanded ? (
              <ChevronDown aria-hidden="true" strokeWidth={2} className="size-4.5" />
            ) : (
              <ChevronUp aria-hidden="true" strokeWidth={2} className="size-4.5" />
            )}
          </button>
          {!working && !waiting && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setApplyPanel({ visible: false })}
              className={iconButton}
            >
              <X aria-hidden="true" strokeWidth={2} className="size-4.5" />
            </button>
          )}
        </div>

        <div aria-hidden="true" className="h-1 bg-track">
          <div
            className="h-full bg-ink transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${total ? (sent / total) * 100 : 0}%` }}
          />
        </div>

        {applyPanel.expanded && (
          <ul id={listId} className="max-h-[min(55vh,26rem)] divide-y divide-chip-line overflow-y-auto">
            {items.map((item) => {
              const job = jobById.get(item.jobId)
              if (!job) return null
              const review = reviewFor(item.jobId)
              return (
                <li key={item.jobId} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={job.company} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ui-sm font-medium">{job.title}</p>
                      <p className="truncate text-xs text-meta">{companies[job.company]}</p>
                    </div>
                    <StatusLabel
                      application={item}
                      onAnswer={() => setAnswering(answering === item.jobId ? null : item.jobId)}
                    />
                  </div>
                  {answering === item.jobId && item.status === 'needs-you' && review && (
                    <div className="mt-3 rounded-xl bg-sidebar p-3">
                      <label htmlFor={`${listId}-${item.jobId}`} className="block text-ui-sm">
                        {companies[job.company]} asks “{review.question}” Here’s my draft.
                      </label>
                      <textarea
                        id={`${listId}-${item.jobId}`}
                        autoFocus // brings the draft into view inside the scrolling list
                        rows={4}
                        value={drafts[item.jobId] ?? review.draft}
                        onChange={(event) => setDrafts({ ...drafts, [item.jobId]: event.target.value })}
                        className="mt-2 block w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-ui-sm outline-none focus:border-ink focus:ring-3 focus:ring-black/8"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAnswering(null)}
                          className={`rounded-lg px-3 py-1.5 text-ui-sm font-semibold text-nav hover:bg-black/5 ${focusRing}`}
                        >
                          Later
                        </button>
                        <button
                          type="button"
                          onClick={() => send(item.jobId)}
                          className={`rounded-lg bg-ink px-3.5 py-1.5 text-ui-sm font-semibold text-white hover:bg-neutral-800 ${focusRing}`}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
