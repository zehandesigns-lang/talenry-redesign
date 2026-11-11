import { createContext, useContext } from 'react'
import type { City } from './data/cities.ts'

export type Step = 'signup' | 'account' | 'profile' | 'matching' | 'dashboard'

export type Seniority = 'entry' | 'mid' | 'senior' | 'lead'

export type Workplace = 'remote' | 'on-site' | 'hybrid'

export type Account = {
  firstName: string
  lastName: string
  /** Data URL of an uploaded photo; null shows the mock profile photo */
  photo: string | null
}

export type Profile = {
  /** Up to three; the first one leads */
  roles: string[]
  minSalary: number | null
  seniority: Seniority | null
  location: City | null
  workplace: Workplace[]
  openToRelocating: boolean | null
  needsVisa: boolean | null
}

export type NoticePeriod = 'immediately' | '2-weeks' | '1-month' | '2-months-plus'

/** Voluntary self-identification; null is unanswered, which forms treat as "prefer not to say" */
export type SelfId = {
  gender: string | null
  transgender: string | null
  ethnicity: string | null
  veteran: string | null
  disability: string | null
}

export type ExperienceType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'

/** One role, as a résumé lists it; months are "01"–"12", years "2024" */
export type ExperienceEntry = {
  id: string
  title: string
  company: string
  location: string
  type: ExperienceType
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  /** Still works here, so there's no end date */
  current: boolean
  description: string
}

export type EducationEntry = {
  id: string
  school: string
  degree: string
  field: string
  startYear: string
  endYear: string
}

/** What auto-apply needs to fill application forms; asked the first time the user auto-applies */
export type ApplicationAnswers = {
  /** An uploaded résumé file; the details below can stand in for it */
  resumeName: string | null
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  phone: string
  postalCode: string
  linkedin: string
  yearsExperience: number | null
  noticePeriod: NoticePeriod | null
  nonCompete: boolean | null
  officeDays: number | null
  /** Only asked for US locations */
  securityClearance: boolean | null
  workedForGovernment: boolean | null
  selfId: SelfId
}

/** Every account starts with this many credits */
export const TOTAL_CREDITS = 700

/** Each auto-apply spends this many credits */
export const AUTO_APPLY_COST = 5

/** The Starter plan caps auto-applies each month, however many credits are left */
export const MONTHLY_AUTO_APPLIES = 10

/** What the Pro plan offers instead (mock figure for the upgrade pitch) */
export const PRO_MONTHLY_AUTO_APPLIES = 100

export type ApplicationStatus = 'queued' | 'filling' | 'needs-you' | 'sent'

/** One job the agent is applying to, as it moves through the queue */
export type Application = {
  jobId: string
  status: ApplicationStatus
  /** When the agent started on this form */
  startedAt: number | null
  /** The user's reply when the agent paused on a question it wasn't sure about */
  answer: string | null
}

/** The live status panel in the bottom-right corner */
export type ApplyPanel = {
  visible: boolean
  expanded: boolean
  /** Jobs in the current run; the next run starts fresh once the panel is dismissed */
  jobIds: string[]
}

/** Pages of the app reachable from the sidebar in this prototype */
export type DashboardPage = 'jobs' | 'outreach'

/** A drafted email the user changed before sending */
export type EmailEdit = { subject: string; body: string }

/** Emails to hiring managers, written by the agent after it applies */
export type OutreachState = {
  /** The user let Talenry send from their Gmail */
  gmailConnected: boolean
  /** Jobs whose hiring manager has been emailed */
  sentJobIds: string[]
  /** When each of those emails went out (ms since epoch) */
  sentAt: Record<string, number>
  edits: Record<string, EmailEdit>
  /** The nudge to do outreach and the Pro offer each show once */
  promptSeen: boolean
  proOfferSeen: boolean
}

export type OnboardingState = {
  step: Step
  page: DashboardPage
  account: Account
  profile: Profile
  /** Credits left to spend on agent actions */
  credits: number
  /** Auto-applies used during `month` (YYYY-MM); the count starts again each month */
  autoApplies: { month: string; used: number }
  appliedJobIds: string[]
  application: ApplicationAnswers
  applications: Application[]
  applyPanel: ApplyPanel
  outreach: OutreachState
}

type UsageState = Pick<OnboardingState, 'credits' | 'autoApplies' | 'appliedJobIds'>

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function autoAppliesLeft({ month, used }: OnboardingState['autoApplies']) {
  return month === monthKey() ? Math.max(0, MONTHLY_AUTO_APPLIES - used) : MONTHLY_AUTO_APPLIES
}

/** Which of these jobs an auto-apply would go out to: new ones only, within this month's cap and the credits left */
export function applicableJobIds(usage: UsageState, jobIds: string[]) {
  const allowance = Math.min(autoAppliesLeft(usage.autoApplies), Math.floor(usage.credits / AUTO_APPLY_COST))
  return jobIds.filter((id) => !usage.appliedJobIds.includes(id)).slice(0, allowance)
}

/** First day of next month, when the auto-apply count resets */
export function nextResetDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

type OnboardingContextValue = OnboardingState & {
  updateAccount: (changes: Partial<Account>) => void
  updateProfile: (changes: Partial<Profile>) => void
  updateApplication: (changes: Partial<ApplicationAnswers>) => void
  goTo: (step: Step) => void
  /** Queues whichever of these jobs the plan allows, spending credits and the monthly allowance */
  autoApply: (jobIds: string[]) => void
  updateApplicationStatus: (jobId: string, changes: Partial<Application>) => void
  setApplyPanel: (changes: Partial<ApplyPanel>) => void
  setPage: (page: DashboardPage) => void
  updateOutreach: (changes: Partial<OutreachState>) => void
  editEmail: (jobId: string, edit: EmailEdit) => void
  markEmailsSent: (jobIds: string[]) => void
  /** Prototype only: pretend a new month started, so the auto-apply count resets */
  startNewMonth: () => void
  /** Back to step 1 with the mock sign-up data */
  reset: () => void
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return context
}
