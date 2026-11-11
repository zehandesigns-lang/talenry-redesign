import { Check, LoaderCircle } from 'lucide-react'
import { companies, type Job } from '../data/jobs.ts'
import { formatPay, formatPosted } from '../lib/jobs.ts'
import type { ApplicationStatus } from '../onboarding.ts'
import { CompanyLogo } from './CompanyLogo.tsx'
import { focusRing } from './styles.ts'

const workplaceLabels = { remote: 'Remote', hybrid: 'Hybrid', 'on-site': 'On-site' }

const secondaryButton = `flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border px-6 text-ui font-semibold whitespace-nowrap transition-colors sm:flex-none ${focusRing}`
const outlineButton = `${secondaryButton} border-control bg-white hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white`
const quietButton = `${secondaryButton} border-transparent bg-tag text-meta`

type JobCardProps = {
  job: Job
  match: number
  /** Show visa tags when the user said they need sponsorship */
  showVisa: boolean
  /** Where this job's application is in the agent's queue; null if not applied */
  status: ApplicationStatus | null
  /** False once this month's auto-applies (or the credits) run out */
  canApply: boolean
  onOpen: () => void
  onApply: () => void
  /** Opens the status panel when the agent is waiting on the user */
  onAnswer: () => void
}

export function JobCard({ job, match, showVisa, status, canApply, onOpen, onApply, onAnswer }: JobCardProps) {
  const tags = [
    job.country,
    workplaceLabels[job.workplace],
    formatPay(job.pay),
    ...(showVisa && job.sponsorsVisa ? ['Sponsors visas'] : []),
    ...(showVisa && job.eVerified ? ['E-Verified'] : []),
  ]

  return (
    <article className="py-8 sm:px-6 sm:pt-16 sm:pb-8.75 lg:px-14">
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.company} className="size-11 sm:size-13" />
        <div className="min-w-0 flex-1">
          <p className="text-ui-sm text-meta">{companies[job.company]}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <h2 className="font-display text-[1.375rem] leading-none font-normal sm:text-[1.75rem]">
              {job.title}
            </h2>
            <time dateTime={job.postedAt} className="text-ui text-soft">
              {formatPosted(job.postedAt)}
            </time>
          </div>
        </div>
        <p className="shrink-0 text-right">
          <span className="block font-display text-2xl leading-none font-normal sm:text-3xl">{match}%</span>
          <span className="block text-ui-lg text-soft">Match</span>
        </p>
      </div>

      <ul aria-label="Details" className="mt-5.5 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <li key={tag} className="flex h-7.5 items-center rounded-lg bg-tag px-2.5 text-ui-sm text-meta">
            {tag}
          </li>
        ))}
      </ul>

      <p className="mt-5.5 max-w-189 text-ui text-soft">{job.description}</p>

      <div className="mt-8 flex gap-2.5 sm:mt-10 sm:justify-end">
        <button type="button" onClick={onOpen} className={outlineButton}>
          Open the listing
        </button>
        {status === 'sent' ? (
          <button type="button" disabled className={quietButton}>
            <Check aria-hidden="true" strokeWidth={2} className="size-4" />
            Applied
          </button>
        ) : status === 'queued' || status === 'filling' ? (
          <button type="button" disabled className={quietButton}>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Applying…
          </button>
        ) : status === 'needs-you' ? (
          <button
            type="button"
            onClick={onAnswer}
            className={`${secondaryButton} border-[#f59e0b] bg-[#fffbeb] text-[#92400e] hover:bg-[#fef3c7]`}
          >
            Needs your answer
          </button>
        ) : (
          <button
            type="button"
            onClick={onApply}
            disabled={!canApply}
            title={canApply ? undefined : 'No auto-applies left this month'}
            className={outlineButton}
          >
            Auto apply
          </button>
        )}
      </div>
    </article>
  )
}
