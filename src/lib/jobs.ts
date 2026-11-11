import { companies, type Currency, type EmploymentType, type Job } from '../data/jobs.ts'
import type { Profile, Seniority, Workplace } from '../onboarding.ts'

export type JobFilters = {
  query: string
  /** Only jobs posted within this many days; null is any time */
  postedWithinDays: number | null
  employment: EmploymentType[]
  workplace: Workplace[]
  countries: string[]
  seniority: Seniority[]
  /** Yearly, in US dollars */
  minPayUsd: number | null
  /** Percent of time */
  maxTravel: number | null
}

export const defaultFilters: JobFilters = {
  query: '',
  postedWithinDays: 7,
  employment: ['full-time'],
  workplace: [],
  countries: [],
  seniority: [],
  minPayUsd: null,
  maxTravel: null,
}

export const clearedFilters: JobFilters = { ...defaultFilters, postedWithinDays: null, employment: [] }

const DAY_MS = 86_400_000

/** Whole days since the job was posted: 0 today, 1 yesterday */
function daysSince(isoDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - new Date(`${isoDate}T00:00:00`).getTime()) / DAY_MS)
}

// Rough mock exchange rates, only used to compare pay across countries
const USD_PER_UNIT: Record<Currency, number> = {
  USD: 1,
  INR: 0.012,
  GBP: 1.27,
  EUR: 1.08,
  CAD: 0.73,
  SGD: 0.74,
  AED: 0.27,
}

export function matchesFilters(job: Job, filters: JobFilters) {
  const query = filters.query.trim().toLowerCase()
  const { postedWithinDays, employment, workplace, countries, seniority, minPayUsd, maxTravel } = filters
  return (
    (!query ||
      job.title.toLowerCase().includes(query) ||
      companies[job.company].toLowerCase().includes(query)) &&
    (postedWithinDays === null || daysSince(job.postedAt) < postedWithinDays) &&
    (!employment.length || employment.includes(job.employment)) &&
    (!workplace.length || workplace.includes(job.workplace)) &&
    (!countries.length || countries.includes(job.country)) &&
    (!seniority.length || seniority.includes(job.seniority)) &&
    (minPayUsd === null || job.pay.max * USD_PER_UNIT[job.pay.currency] >= minPayUsd) &&
    (maxTravel === null || job.travel <= maxTravel)
  )
}

const LEVEL_WORDS = new Set(['ai', 'senior', 'lead', 'junior', 'staff', 'principal'])
const mentionsAi = (text: string) => /\bai\b/i.test(text)

function roleFit(role: string, title: string) {
  const words = role.toLowerCase().split(/[^a-z]+/).filter((w) => w && !LEVEL_WORDS.has(w))
  const head = words.slice(-2).join(' ') // "product manager", "data scientist"…
  if (head && title.toLowerCase().includes(head)) return mentionsAi(role) === mentionsAi(title) ? 12 : 9
  return words.length && title.toLowerCase().includes(words[words.length - 1]) ? 4 : 0
}

/** Mock match score: the job's base fit, nudged by the answers from onboarding. */
export function matchScore(job: Job, profile: Profile) {
  let score = job.baseMatch + Math.max(0, ...profile.roles.map((role) => roleFit(role, job.title)))
  if (job.seniority === profile.seniority) score += 4
  if (profile.workplace.includes(job.workplace)) score += 3
  if (job.country === profile.location?.country) score += 3
  if (profile.needsVisa && !job.sponsorsVisa && job.country !== profile.location?.country) score -= 10
  return Math.max(35, Math.min(97, score))
}

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  SGD: 'S$',
  AED: 'AED ',
}

export function formatPay({ min, max, currency }: Job['pay']) {
  if (currency === 'INR') return `₹${min / 100_000}–${max / 100_000} LPA`
  return `${SYMBOLS[currency]}${min / 1000}k–${max / 1000}k`
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatPosted(isoDate: string) {
  return dateFormat.format(new Date(`${isoDate}T00:00:00`))
}
