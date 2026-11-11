import { useEffect, useState, type ReactNode } from 'react'
import {
  AUTO_APPLY_COST,
  OnboardingContext,
  TOTAL_CREDITS,
  applicableJobIds,
  monthKey,
  type Account,
  type Application,
  type ApplicationAnswers,
  type ApplyPanel,
  type DashboardPage,
  type EmailEdit,
  type OnboardingState,
  type OutreachState,
  type Profile,
  type Step,
} from './onboarding.ts'

const STORAGE_KEY = 'talenry-prototype'
const STEPS: Step[] = ['signup', 'account', 'profile', 'matching', 'dashboard']

const initialState: OnboardingState = {
  step: 'signup',
  page: 'jobs',
  // Filled in by the (mock) Google sign-in on the first screen
  account: { firstName: '', lastName: '', photo: null },
  // The most common answers start selected, so most people only pick a role and a location
  profile: {
    roles: [],
    minSalary: null,
    seniority: 'mid',
    location: null,
    workplace: ['remote'],
    openToRelocating: null,
    needsVisa: false,
  },
  credits: TOTAL_CREDITS,
  autoApplies: { month: monthKey(), used: 0 },
  appliedJobIds: [],
  application: {
    resumeName: null,
    experience: [],
    education: [],
    skills: [],
    phone: '',
    postalCode: '',
    linkedin: '',
    yearsExperience: null,
    noticePeriod: null,
    nonCompete: null,
    officeDays: null,
    securityClearance: null,
    workedForGovernment: null,
    selfId: { gender: null, transgender: null, ethnicity: null, veteran: null, disability: null },
  },
  applications: [],
  applyPanel: { visible: false, expanded: true, jobIds: [] },
  outreach: { gmailConnected: false, sentJobIds: [], sentAt: {}, edits: {}, promptSeen: false, proOfferSeen: false },
}

function loadState(): OnboardingState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const appliedJobIds: string[] = Array.isArray(parsed.appliedJobIds) ? parsed.appliedJobIds : []
      const step: Step = STEPS.includes(parsed.step) ? parsed.step : initialState.step
      const profile: Profile = { ...initialState.profile, ...parsed.profile }
      // Preselected answers came later: fill the gaps for anyone still setting up
      if (step === 'signup' || step === 'account' || step === 'profile') {
        profile.seniority ??= initialState.profile.seniority
        // Workplace is a single choice now
        profile.workplace = profile.workplace.length ? profile.workplace.slice(0, 1) : initialState.profile.workplace
        profile.needsVisa ??= initialState.profile.needsVisa
      }
      return {
        step,
        page: parsed.page === 'outreach' ? 'outreach' : 'jobs',
        account: { ...initialState.account, ...parsed.account },
        profile,
        credits: typeof parsed.credits === 'number' ? parsed.credits : initialState.credits,
        autoApplies: parsed.autoApplies ?? initialState.autoApplies,
        appliedJobIds,
        application: {
          ...initialState.application,
          ...parsed.application,
          selfId: { ...initialState.application.selfId, ...parsed.application?.selfId },
        },
        // Applications saved before the live queue existed count as sent
        applications: Array.isArray(parsed.applications)
          ? parsed.applications
          : appliedJobIds.map((jobId) => ({ jobId, status: 'sent', startedAt: null, answer: null })),
        applyPanel: parsed.applyPanel ?? initialState.applyPanel,
        outreach: { ...initialState.outreach, ...parsed.outreach },
      }
    }
  } catch {
    // Storage blocked or corrupt: start from the beginning
  }
  return initialState
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Quota exceeded or storage blocked: progress just won't survive a refresh
    }
  }, [state])

  const value = {
    ...state,
    updateAccount: (changes: Partial<Account>) =>
      setState((s) => ({ ...s, account: { ...s.account, ...changes } })),
    updateProfile: (changes: Partial<Profile>) =>
      setState((s) => ({ ...s, profile: { ...s.profile, ...changes } })),
    updateApplication: (changes: Partial<ApplicationAnswers>) =>
      setState((s) => ({ ...s, application: { ...s.application, ...changes } })),
    goTo: (step: Step) => setState((s) => ({ ...s, step })),
    autoApply: (jobIds: string[]) =>
      setState((s) => {
        const ids = applicableJobIds(s, jobIds)
        if (!ids.length) return s
        const month = monthKey()
        const used = s.autoApplies.month === month ? s.autoApplies.used : 0
        const queued: Application[] = ids.map((jobId) => ({ jobId, status: 'queued', startedAt: null, answer: null }))
        return {
          ...s,
          credits: s.credits - ids.length * AUTO_APPLY_COST,
          autoApplies: { month, used: used + ids.length },
          appliedJobIds: [...s.appliedJobIds, ...ids],
          applications: [...s.applications, ...queued],
          // Join the run in progress, or start a new one if the panel was dismissed
          applyPanel: s.applyPanel.visible
            ? { ...s.applyPanel, expanded: true, jobIds: [...s.applyPanel.jobIds, ...ids] }
            : { visible: true, expanded: true, jobIds: ids },
        }
      }),
    updateApplicationStatus: (jobId: string, changes: Partial<Application>) =>
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) => (a.jobId === jobId ? { ...a, ...changes } : a)),
      })),
    setApplyPanel: (changes: Partial<ApplyPanel>) =>
      setState((s) => ({ ...s, applyPanel: { ...s.applyPanel, ...changes } })),
    setPage: (page: DashboardPage) => setState((s) => ({ ...s, page })),
    updateOutreach: (changes: Partial<OutreachState>) =>
      setState((s) => ({ ...s, outreach: { ...s.outreach, ...changes } })),
    editEmail: (jobId: string, edit: EmailEdit) =>
      setState((s) => ({ ...s, outreach: { ...s.outreach, edits: { ...s.outreach.edits, [jobId]: edit } } })),
    markEmailsSent: (jobIds: string[]) =>
      setState((s) => {
        const fresh = jobIds.filter((id) => !s.outreach.sentJobIds.includes(id))
        const now = Date.now()
        return {
          ...s,
          outreach: {
            ...s.outreach,
            sentJobIds: [...s.outreach.sentJobIds, ...fresh],
            sentAt: { ...s.outreach.sentAt, ...Object.fromEntries(fresh.map((id) => [id, now])) },
          },
        }
      }),
    startNewMonth: () => setState((s) => ({ ...s, autoApplies: { month: monthKey(), used: 0 } })),
    reset: () => setState(initialState),
  }

  return <OnboardingContext value={value}>{children}</OnboardingContext>
}
