import { ArrowLeft, FileText, FileUp, LoaderCircle, PenLine, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import type { Job } from '../data/jobs.ts'
import { readMockResume } from '../data/mockResume.ts'
import { track } from '../lib/analytics.ts'
import { describeMissing, isJobReady, missingAnswers } from '../lib/application.ts'
import { describeResume, hasResumeDetails, newRole, yearsOfExperience } from '../lib/resume.ts'
import { useOnboarding, type NoticePeriod, type SelfId } from '../onboarding.ts'
import { ManualResumeForm } from './ManualResumeForm.tsx'
import { Segmented, type SegmentedOption } from './Segmented.tsx'
import { SelectField } from './SelectField.tsx'
import { focusRing, primaryButtonClass } from './styles.ts'
import { TextField } from './TextField.tsx'

const noticeOptions: SegmentedOption<NoticePeriod>[] = [
  { value: 'immediately', label: 'Immediately' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '1-month', label: '1 month' },
  { value: '2-months-plus', label: '2+ months' },
]

const officeDayOptions: SegmentedOption<string>[] = ['0', '1', '2', '3', '4', '5'].map((day) => ({
  value: day,
  label: day,
}))

type YesNo = 'yes' | 'no'

const yesNoOptions: SegmentedOption<YesNo>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const toYesNo = (value: boolean | null): YesNo[] => (value === null ? [] : [value ? 'yes' : 'no'])

const genderOptions: SegmentedOption<string>[] = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'decline', label: 'Prefer not to say' },
]

const yesNoDeclineOptions: SegmentedOption<string>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'decline', label: 'Prefer not to say' },
]

const ethnicityOptions = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Two or more races',
  'Prefer not to say',
].map((label) => ({ value: label, label }))

const veteranOptions = [
  { value: 'protected', label: 'I am a protected veteran' },
  { value: 'not-veteran', label: 'I am not a veteran' },
  { value: 'decline', label: 'Prefer not to say' },
]

const secondaryButton = `rounded-xl border border-control bg-white px-6 py-[1.1875rem] text-action font-medium whitespace-nowrap transition-colors hover:bg-neutral-50 ${focusRing}`
const smallOutlineButton = `shrink-0 rounded-lg border border-ink bg-white px-4 py-2.5 text-ui font-semibold whitespace-nowrap transition-colors hover:bg-black/5 disabled:cursor-wait disabled:opacity-50 ${focusRing}`
const choiceCard = `flex min-h-60 flex-col rounded-2xl border border-chip-line bg-white p-5 text-left transition-colors hover:border-ink disabled:cursor-wait sm:p-6 ${focusRing}`
const twoColumns = 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-2.5'

type View = 'choose' | 'manual' | 'answers' | 'selfId'

type HeaderProps = {
  title: string
  intro: string
  headingId: string
  headingRef: RefObject<HTMLHeadingElement | null>
  onClose: () => void
  onBack?: () => void
}

function Header({ title, intro, headingId, headingRef, onClose, onBack }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 sm:px-10 sm:pt-9">
      <div>
        {onBack && (
          <button type="button" onClick={onBack} className={`mb-5 flex items-center gap-2 rounded-md text-body ${focusRing}`}>
            <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-6" />
            Back
          </button>
        )}
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="font-display text-[1.875rem] leading-tight font-light tracking-[-0.03em] outline-none sm:text-[2.375rem]"
        >
          {title}
        </h2>
        <p className="mt-2 max-w-130 text-body text-subtle">{intro}</p>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`grid size-10 shrink-0 place-items-center rounded-lg text-nav transition-colors hover:bg-track ${focusRing}`}
      >
        <X aria-hidden="true" strokeWidth={1.75} className="size-5.5" />
      </button>
    </header>
  )
}

function ChoiceIcon({ children }: { children: ReactNode }) {
  return <span className="grid size-11 place-items-center rounded-xl bg-sidebar [&>svg]:size-5.5">{children}</span>
}

type CompleteProfileModalProps = {
  /** The matches in view, for the "Ready for N of M" count */
  jobs: Job[]
  onClose: () => void
  /** Everything is answered; the auto-apply that opened the modal can go ahead */
  onComplete: () => void
}

/** Opens as soon as it mounts; the parent mounts it when an auto-apply needs more from the user. */
export function CompleteProfileModal({ jobs, onClose, onComplete }: CompleteProfileModalProps) {
  const { profile, application, updateApplication } = useOnboarding()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const headingId = useId()
  // Start with the résumé choice unless the user already gave one
  const [view, setView] = useState<View>(() =>
    application.resumeName !== null || hasResumeDetails(application) ? 'answers' : 'choose',
  )
  const [readingResume, setReadingResume] = useState(false)
  const [yearsFromResume, setYearsFromResume] = useState(false)

  const country = profile.location?.country
  const inUS = country === 'United States'
  const missing = missingAnswers(application, inUS)
  const ready = jobs.filter((job) => isJobReady(job, application, inUS)).length
  const { selfId } = application
  const selfIdAnswered = Object.values(selfId).filter(Boolean).length
  const detailsReady = hasResumeDetails(application)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => window.clearTimeout(timer.current)
  }, [])

  // Each view replaces the content, so start keyboard users at the new heading
  useEffect(() => {
    if (dialogRef.current?.open) headingRef.current?.focus()
  }, [view])

  const close = () => dialogRef.current?.close()

  function handleResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again
    if (!file) return
    setReadingResume(true)
    track('resume_option_chosen', { option: 'upload' })
    // Mock parsing: a short pause, then take what the résumé would tell us
    timer.current = window.setTimeout(() => {
      const found = readMockResume()
      const fillYears = application.yearsExperience === null
      updateApplication({
        resumeName: file.name,
        ...found,
        ...(fillYears && { yearsExperience: yearsOfExperience(found.experience) }),
      })
      setYearsFromResume(fillYears)
      setReadingResume(false)
      setView('answers')
      track('resume_uploaded', { file: file.name })
    }, 1400)
  }

  function fillManually() {
    if (application.experience.length === 0) updateApplication({ experience: [newRole()] })
    setView('manual')
    track('resume_option_chosen', { option: 'manual' })
  }

  function continueFromManual() {
    if (application.yearsExperience === null) {
      const years = yearsOfExperience(application.experience)
      if (years !== null) {
        updateApplication({ yearsExperience: years })
        setYearsFromResume(true)
      }
    }
    setView('answers')
  }

  function setSelfId(changes: Partial<SelfId>) {
    updateApplication({ selfId: { ...selfId, ...changes } })
  }

  function openSelfId() {
    setView('selfId')
    track('self_id_opened')
  }

  function start() {
    track('agent_ready_completed', { ready, total: jobs.length })
    onComplete()
  }

  const bodyClass =
    'relative flex-1 overflow-y-auto overscroll-contain border-y border-chip-line px-6 py-6 sm:px-10 sm:py-8'
  const headerProps = { headingId, headingRef, onClose: close }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      className="m-auto h-dvh max-h-none w-full max-w-none flex-col overflow-hidden border-0 bg-white p-0 text-ink backdrop:bg-black/40 open:flex sm:h-fit sm:max-h-[92dvh] sm:w-[calc(100%-4rem)] sm:max-w-177.5 sm:rounded-3xl"
    >
      {view === 'choose' && (
        <>
          <Header
            {...headerProps}
            title="Let’s complete your profile"
            intro="Before I apply, I need what a résumé tells employers: your roles, education and skills. Pick whichever is quicker for you."
          />
          <div key="choose" className={bodyClass}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => resumeRef.current?.click()}
                disabled={readingResume}
                className={choiceCard}
              >
                <span className="flex items-start justify-between gap-3">
                  <ChoiceIcon>
                    <FileUp aria-hidden="true" strokeWidth={1.75} />
                  </ChoiceIcon>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-ui-sm font-semibold text-white">Quickest</span>
                </span>
                <span className="mt-5 font-display text-[1.625rem] leading-tight font-light">Upload your résumé</span>
                <span className="mt-2 text-ui-sm text-subtle">
                  PDF or Word. I’ll read it and fill in your roles, education and skills.
                </span>
                <span aria-live="polite" className="mt-auto flex items-center gap-2 pt-6 text-ui-sm text-meta">
                  {readingResume ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Reading your résumé…
                    </>
                  ) : (
                    'Under a minute'
                  )}
                </span>
              </button>

              <button type="button" onClick={fillManually} disabled={readingResume} className={choiceCard}>
                <ChoiceIcon>
                  <PenLine aria-hidden="true" strokeWidth={1.75} />
                </ChoiceIcon>
                <span className="mt-5 font-display text-[1.625rem] leading-tight font-light">Fill it in manually</span>
                <span className="mt-2 text-ui-sm text-subtle">
                  Add your roles with dates and responsibilities, your education and skills. A LinkedIn screenshot can
                  fill most of it.
                </span>
                <span className="mt-auto pt-6 text-ui-sm text-meta">About 5 minutes</span>
              </button>
            </div>
            <p className="mt-6 text-ui-sm text-subtle">
              After this, a few questions application forms ask, like your notice period.
            </p>
            <input
              ref={resumeRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResume}
              className="hidden"
            />
          </div>
        </>
      )}

      {view === 'manual' && (
        <>
          <Header
            {...headerProps}
            title="Fill in your details"
            intro="Everything a résumé would tell an employer. One role, school or skill is enough to start."
            onBack={() => setView('choose')}
          />
          <div key="manual" className={bodyClass}>
            <ManualResumeForm />
          </div>
          <footer className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10">
            <p aria-live="polite" className="text-ui-sm text-subtle">
              {detailsReady
                ? `${describeResume(application)}. Next, a few application questions.`
                : 'Add a role with its dates, a school or a skill to continue.'}
            </p>
            <button
              type="button"
              onClick={continueFromManual}
              disabled={!detailsReady}
              className={`whitespace-nowrap ${primaryButtonClass}`}
            >
              Continue
            </button>
          </footer>
        </>
      )}

      {view === 'answers' && (
        <>
          <Header
            {...headerProps}
            title="Let’s complete your profile"
            intro="Application forms ask these on almost every job. Answer them once and I’ll fill them in each time I apply."
          />
          <div key="answers" className={bodyClass}>
            <section
              aria-label="Your résumé"
              className="flex flex-col gap-3 rounded-xl border border-sidebar-line bg-sidebar p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <FileText aria-hidden="true" strokeWidth={1.75} className="size-6 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-body">{application.resumeName ?? 'Your details'}</p>
                  <p className="text-ui-sm text-subtle">{describeResume(application)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setView('manual')} className={smallOutlineButton}>
                Review details
              </button>
            </section>

            <div className={`mt-8 ${twoColumns}`}>
              <TextField
                label="Phone number"
                type="tel"
                autoComplete="tel"
                placeholder={inUS ? '+1 415 555 0134' : '+91 98765 43210'}
                value={application.phone}
                onChange={(event) => updateApplication({ phone: event.target.value })}
                hint="Recruiters call this. It only goes on applications."
              />
              <TextField
                label="Postal code"
                autoComplete="postal-code"
                placeholder={inUS ? '94107' : '380015'}
                value={application.postalCode}
                onChange={(event) => updateApplication({ postalCode: event.target.value })}
                hint="Workday and similar forms ask for an address."
              />
              <TextField
                label="LinkedIn (optional)"
                inputMode="url"
                autoComplete="url"
                placeholder="linkedin.com/in/your-name"
                value={application.linkedin}
                onChange={(event) => updateApplication({ linkedin: event.target.value })}
                hint="Many forms have a LinkedIn field."
              />
              <TextField
                label="Years of experience"
                inputMode="numeric"
                placeholder="0"
                value={application.yearsExperience ?? ''}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 2)
                  updateApplication({ yearsExperience: digits ? Number(digits) : null })
                  setYearsFromResume(false)
                }}
                hint={yearsFromResume ? 'Worked out from your roles. Check and edit.' : 'Whole years in your field.'}
              />
            </div>

            <Segmented
              className="mt-6"
              label="Notice period"
              options={noticeOptions}
              selected={application.noticePeriod ? [application.noticePeriod] : []}
              onChange={([noticePeriod]) => updateApplication({ noticePeriod })}
              trackClassName="grid grid-cols-2 sm:inline-flex"
              hint="How soon you could start. Nearly every form asks."
            />

            <div className={`mt-6 ${twoColumns}`}>
              <Segmented
                label="Bound by a non-compete?"
                options={yesNoOptions}
                selected={toYesNo(application.nonCompete)}
                onChange={([answer]) => updateApplication({ nonCompete: answer === 'yes' })}
                hint="An agreement that limits where you can work next."
              />
              <Segmented
                label="Days a week in an office"
                options={officeDayOptions}
                compact
                selected={application.officeDays === null ? [] : [String(application.officeDays)]}
                onChange={([days]) => updateApplication({ officeDays: Number(days) })}
                hint="The most you’d go in. 0 means remote only."
              />
            </div>

            {inUS && (
              <div className={`mt-6 ${twoColumns}`}>
                <Segmented
                  label="Hold a security clearance?"
                  options={yesNoOptions}
                  selected={toYesNo(application.securityClearance)}
                  onChange={([answer]) => updateApplication({ securityClearance: answer === 'yes' })}
                  hint="Government and defence employers ask."
                />
                <Segmented
                  label="Ever worked for a government?"
                  options={yesNoOptions}
                  selected={toYesNo(application.workedForGovernment)}
                  onChange={([answer]) => updateApplication({ workedForGovernment: answer === 'yes' })}
                  hint="Any level, including state-owned companies."
                />
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 rounded-xl border border-chip-line p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
              <div>
                <p className="text-body">Voluntary self-identification (optional)</p>
                <p className="mt-1 text-ui-sm text-subtle">
                  {!inUS
                    ? 'Not needed for jobs in your country.'
                    : selfIdAnswered
                      ? `${selfIdAnswered} of 5 answered. They never affect your matches.`
                      : 'US employers ask these. They never affect your matches.'}
                </p>
              </div>
              {inUS && (
                <button type="button" onClick={openSelfId} className={smallOutlineButton}>
                  {selfIdAnswered ? 'Edit answers' : 'Add answers'}
                </button>
              )}
            </div>
          </div>

          <footer className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10">
            <div aria-live="polite" className="min-w-0">
              <p className="text-ui font-semibold">
                Ready for {ready} of {jobs.length} matches
              </p>
              <div aria-hidden="true" className="mt-2 h-1.5 w-full max-w-60 overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-ink transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${jobs.length ? (ready / jobs.length) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-ui-sm text-subtle">
                {missing.length ? `I still need ${describeMissing(missing)}.` : 'That’s everything I need.'}
              </p>
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2.5 sm:flex-row">
              <button type="button" onClick={close} className={`w-full sm:w-auto ${secondaryButton}`}>
                Not now
              </button>
              <button
                type="button"
                onClick={start}
                disabled={missing.length > 0}
                className={`whitespace-nowrap ${primaryButtonClass}`}
              >
                Start applying
              </button>
            </div>
          </footer>
        </>
      )}

      {view === 'selfId' && (
        <>
          <Header
            {...headerProps}
            title="Voluntary self-identification"
            intro="US employers ask these on most applications. They’re voluntary and never affect your match scores. Skip any of them."
            onBack={() => setView('answers')}
          />
          <div key="selfId" className={bodyClass}>
            <Segmented
              label="Gender"
              options={genderOptions}
              selected={selfId.gender ? [selfId.gender] : []}
              onChange={([gender]) => setSelfId({ gender })}
              trackClassName="grid grid-cols-2 sm:inline-flex"
            />
            <Segmented
              className="mt-6"
              label="Do you identify as transgender?"
              options={yesNoDeclineOptions}
              selected={selfId.transgender ? [selfId.transgender] : []}
              onChange={([transgender]) => setSelfId({ transgender })}
            />
            <div className={`mt-6 ${twoColumns}`}>
              <SelectField
                label="Race / ethnicity"
                placeholder="Choose one"
                options={ethnicityOptions}
                value={selfId.ethnicity ?? ''}
                onChange={(event) => setSelfId({ ethnicity: event.target.value || null })}
              />
              <SelectField
                label="Veteran status"
                placeholder="Choose one"
                options={veteranOptions}
                value={selfId.veteran ?? ''}
                onChange={(event) => setSelfId({ veteran: event.target.value || null })}
              />
            </div>
            <Segmented
              className="mt-6"
              label="Disability"
              options={yesNoDeclineOptions}
              selected={selfId.disability ? [selfId.disability] : []}
              onChange={([disability]) => setSelfId({ disability })}
            />
          </div>
          <footer className="flex justify-end px-6 py-5 sm:px-10">
            <button type="button" onClick={() => setView('answers')} className={primaryButtonClass}>
              Done
            </button>
          </footer>
        </>
      )}
    </dialog>
  )
}
