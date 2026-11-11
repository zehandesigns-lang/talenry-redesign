import { Menu } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ApplyStatusPanel } from '../components/ApplyStatusPanel.tsx'
import { CompleteProfileModal } from '../components/CompleteProfileModal.tsx'
import { OutreachPrompt } from '../components/OutreachDialogs.tsx'
import { JobCard } from '../components/JobCard.tsx'
import { JobFilterBar } from '../components/JobFilterBar.tsx'
import { Brand, Sidebar } from '../components/Sidebar.tsx'
import { focusRing } from '../components/styles.ts'
import { jobs } from '../data/jobs.ts'
import { track } from '../lib/analytics.ts'
import { missingAnswers } from '../lib/application.ts'
import { clearedFilters, defaultFilters, matchScore, matchesFilters, type JobFilters } from '../lib/jobs.ts'
import { outreachEmails } from '../lib/outreach.ts'
import { usePresence } from '../lib/usePresence.ts'
import {
  AUTO_APPLY_COST,
  MONTHLY_AUTO_APPLIES,
  applicableJobIds,
  autoAppliesLeft,
  nextResetDate,
  useOnboarding,
} from '../onboarding.ts'
import { Outreach } from './Outreach.tsx'

const TOP_COUNT = 10

const resetFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

// Countries with the most openings first
const countries = Object.entries(
  jobs.reduce<Record<string, number>>((counts, job) => {
    counts[job.country] = (counts[job.country] ?? 0) + 1
    return counts
  }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .map(([country]) => country)

function SkeletonCard() {
  return (
    <div className="py-8 sm:px-6 sm:pt-16 sm:pb-8.75 lg:px-14">
      <div className="flex items-start gap-3">
        <div className="size-11 shrink-0 rounded-[0.625rem] bg-track sm:size-13" />
        <div className="flex-1">
          <div className="h-3.5 w-24 rounded bg-track" />
          <div className="mt-3 h-6 w-3/4 rounded bg-track" />
        </div>
        <div className="h-8 w-14 rounded bg-track" />
      </div>
      <div className="mt-5.5 flex gap-3">
        <div className="h-7.5 w-16 rounded-lg bg-track" />
        <div className="h-7.5 w-20 rounded-lg bg-track" />
        <div className="h-7.5 w-24 rounded-lg bg-track" />
      </div>
      <div className="mt-5.5 h-4 w-full max-w-189 rounded bg-track" />
      <div className="mt-2 h-4 w-2/3 rounded bg-track" />
    </div>
  )
}

type JobsDashboardProps = {
  /** True while the post-onboarding search runs: the board sits blurred behind the loading card */
  searching?: boolean
}

export function JobsDashboard({ searching = false }: JobsDashboardProps) {
  const state = useOnboarding()
  const { profile, credits, autoApplies, appliedJobIds, application, applications, applyPanel, autoApply, setApplyPanel } =
    state
  const { page, setPage, outreach, updateOutreach } = state
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)
  /** Jobs waiting on the "complete your profile" modal before they can be auto-applied to */
  const [pendingApply, setPendingApply] = useState<string[] | null>(null)
  const [outreachPromptOpen, setOutreachPromptOpen] = useState(false)
  /**
   * True for a moment after the search ends, while the listings rise into place. Worked out during
   * render, so the first frame without the search already holds them back (no flash of the full list).
   */
  const entering = usePresence(searching, 1800).leaving
  const drawerRef = useRef<HTMLDialogElement>(null)
  const viewLogged = useRef(false)

  const ranked = useMemo(
    () =>
      jobs
        .map((job) => ({ job, match: matchScore(job, profile) }))
        .sort((a, b) => b.match - a.match || b.job.postedAt.localeCompare(a.job.postedAt)),
    [profile],
  )
  const results = ranked.filter(({ job }) => matchesFilters(job, filters))
  const statusByJob = new Map(applications.map((a) => [a.jobId, a.status]))
  const outreachDrafts = outreachEmails(state).filter((email) => !email.sent).length
  // The agent is done with this run: everything is sent, or waiting on an answer from the user
  const runSettled =
    applyPanel.jobIds.length > 0 &&
    applyPanel.jobIds.every((id) => ['sent', 'needs-you'].includes(statusByJob.get(id) ?? ''))

  // The Starter plan allows 10 auto-applies a month; leftover credits can't buy more
  const usage = { credits, autoApplies, appliedJobIds }
  const appliesLeft = autoAppliesLeft(autoApplies)
  const canApply = appliesLeft > 0 && credits >= AUTO_APPLY_COST
  const topBatch = applicableJobIds(
    usage,
    results.filter(({ job }) => !appliedJobIds.includes(job.id)).slice(0, TOP_COUNT).map(({ job }) => job.id),
  )
  const reset = resetFormat.format(nextResetDate())
  const applyNote =
    appliesLeft === 0
      ? `You’ve used all ${MONTHLY_AUTO_APPLIES} auto-applies this month. More from ${reset}.`
      : !canApply
        ? 'There aren’t enough credits left to auto-apply.'
        : topBatch.length > 0
          ? `Uses ${topBatch.length * AUTO_APPLY_COST} credits · ${appliesLeft} of ${MONTHLY_AUTO_APPLIES} auto-applies left this month`
          : `${appliesLeft} of ${MONTHLY_AUTO_APPLIES} auto-applies left this month`

  function startApplications(jobIds: string[]) {
    const applying = applicableJobIds(usage, jobIds)
    if (!applying.length) return
    autoApply(applying)
    track('applications_started', { count: applying.length, creditsUsed: applying.length * AUTO_APPLY_COST })
  }

  function requestAutoApply(jobIds: string[]) {
    track('apply_clicked', { jobs: jobIds })
    const inUS = profile.location?.country === 'United States'
    if (missingAnswers(application, inUS).length === 0) {
      startApplications(jobIds)
      return
    }
    setPendingApply(jobIds) // first auto-apply: collect what application forms ask
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  // Once the agent finishes applying, point the user at the emails it wrote (once, after a beat)
  useEffect(() => {
    if (searching || pendingApply || !runSettled || !outreachDrafts || outreach.promptSeen || page !== 'jobs') return
    const timer = window.setTimeout(() => {
      setOutreachPromptOpen(true)
      updateOutreach({ promptSeen: true })
      track('outreach_prompt_shown', { drafts: outreachDrafts })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [searching, pendingApply, runSettled, outreachDrafts, outreach.promptSeen, page, updateOutreach])

  useEffect(() => {
    // StrictMode runs effects twice in development; and the matches only count once they're shown
    if (viewLogged.current || searching) return
    viewLogged.current = true
    track('matches_viewed', { count: results.length, above85: results.filter((r) => r.match > 85).length })
  }, [results, searching])

  return (
    <div
      inert={searching}
      // The blur eases off to `none`, not blur(0): any filter would trap the fixed status panel inside this box
      className={`flex min-h-dvh bg-white transition-[filter] duration-700 ease-out motion-reduce:transition-none ${
        searching ? '[filter:blur(14px)]' : '[filter:none]'
      }`}
    >
      <Sidebar className="sticky top-0 hidden h-dvh sm:flex" outreachCount={outreachDrafts} />

      <dialog
        ref={drawerRef}
        aria-label="Menu"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close() // backdrop
        }}
        className="m-0 h-dvh max-h-none w-75 max-w-[85vw] border-0 bg-sidebar p-0 backdrop:bg-black/30"
      >
        <Sidebar className="flex h-full" outreachCount={outreachDrafts} onNavigate={() => drawerRef.current?.close()} />
      </dialog>

      <ApplyStatusPanel />

      {outreachPromptOpen && (
        <OutreachPrompt
          drafts={outreachDrafts}
          onLater={() => {
            setOutreachPromptOpen(false)
            track('outreach_prompt_dismissed')
          }}
          onReview={() => {
            setOutreachPromptOpen(false)
            setPage('outreach')
            track('outreach_prompt_accepted')
          }}
        />
      )}

      {pendingApply && (
        <CompleteProfileModal
          jobs={results.map(({ job }) => job)}
          onClose={() => setPendingApply(null)}
          onComplete={() => {
            startApplications(pendingApply)
            setPendingApply(null)
          }}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-sidebar-line bg-sidebar px-4 py-2.5 sm:hidden">
          <Brand className="text-[1.375rem]" />
          <button
            type="button"
            aria-label={outreachDrafts ? `Open menu, ${outreachDrafts} emails to send` : 'Open menu'}
            onClick={() => drawerRef.current?.showModal()}
            className={`relative grid size-10 place-items-center rounded-lg text-nav ${focusRing}`}
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.75} />
            {outreachDrafts > 0 && page !== 'outreach' && (
              <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-ink ring-2 ring-sidebar" />
            )}
          </button>
        </div>

        {/* Extra room at the end so the status panel never sits on the last card */}
        <main className={`px-4 pt-6 sm:px-8 sm:pt-7.75 ${applyPanel.visible ? 'pb-40' : 'pb-16'}`}>
          <div className="mx-auto max-w-239.25">
            {page === 'outreach' ? (
              <Outreach />
            ) : (
              <>
              <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-1.5">
                <h1 className="font-display text-[2rem] leading-none font-light sm:text-[2.375rem]">
                  {results.length} {results.length === 1 ? 'job' : 'jobs'} found
                </h1>
                <button
                  type="button"
                  disabled={topBatch.length === 0}
                  onClick={() => requestAutoApply(topBatch)}
                  className={`h-12.5 rounded-lg bg-ink px-6 text-ui font-medium whitespace-nowrap text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-35 ${focusRing}`}
                >
                  Auto apply to top {topBatch.length || TOP_COUNT}
                </button>
              </header>
              <p aria-live="polite" className="mt-2.5 text-ui-sm text-soft sm:px-1.5 sm:text-right">
                {applyNote}
              </p>

              <JobFilterBar
                className="mt-5 sm:mt-6"
                filters={filters}
                onChange={setFilters}
                countries={countries}
              />

              {searching ? (
                <ul aria-hidden="true" className="mt-2">
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="border-b border-divider last:border-b-0">
                      <SkeletonCard />
                    </li>
                  ))}
                </ul>
              ) : results.length > 0 ? (
                <ul className="mt-2">
                  {results.map(({ job, match }, i) => (
                    <li
                      key={job.id}
                      // After the search, cards rise into place one after another (the first few are on screen)
                      className={`border-b border-divider last:border-b-0 ${entering ? 'animate-card-in motion-reduce:animate-none' : ''}`}
                      style={entering ? { animationDelay: `${150 + Math.min(i, 6) * 90}ms` } : undefined}
                    >
                      <JobCard
                        job={job}
                        match={match}
                        showVisa={profile.needsVisa === true}
                        status={statusByJob.get(job.id) ?? null}
                        canApply={canApply}
                        onOpen={() => track('listing_opened', { job: job.id })}
                        onApply={() => requestAutoApply([job.id])}
                        onAnswer={() => setApplyPanel({ visible: true, expanded: true })}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-ui-lg">No jobs match these filters.</p>
                  <button
                    type="button"
                    onClick={() => setFilters(clearedFilters)}
                    className={`mt-3 rounded-md text-ui font-semibold underline underline-offset-4 ${focusRing}`}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
