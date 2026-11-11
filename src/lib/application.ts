import type { CompanyId, Job } from '../data/jobs.ts'
import type { ApplicationAnswers } from '../onboarding.ts'
import { hasResumeDetails } from './resume.ts'

export type Question =
  | 'resume'
  | 'phone'
  | 'postalCode'
  | 'years'
  | 'notice'
  | 'nonCompete'
  | 'officeDays'
  | 'clearance'
  | 'government'

const labels: Record<Question, string> = {
  resume: 'your résumé',
  phone: 'a phone number',
  postalCode: 'your postal code',
  years: 'your years of experience',
  notice: 'your notice period',
  nonCompete: 'the non-compete answer',
  officeDays: 'your office days',
  clearance: 'the security clearance answer',
  government: 'the government work answer',
}

function isAnswered(question: Question, answers: ApplicationAnswers) {
  switch (question) {
    case 'resume':
      return answers.resumeName !== null || hasResumeDetails(answers)
    case 'phone':
      return answers.phone.replace(/\D/g, '').length >= 8
    case 'postalCode':
      return answers.postalCode.trim().length >= 3
    case 'years':
      return answers.yearsExperience !== null
    case 'notice':
      return answers.noticePeriod !== null
    case 'nonCompete':
      return answers.nonCompete !== null
    case 'officeDays':
      return answers.officeDays !== null
    case 'clearance':
      return answers.securityClearance !== null
    case 'government':
      return answers.workedForGovernment !== null
  }
}

/** Everything auto-apply needs before it can fill forms on the user's behalf */
export function missingAnswers(answers: ApplicationAnswers, inUS: boolean) {
  const required: Question[] = [
    'resume',
    'phone',
    'postalCode',
    'years',
    'notice',
    'nonCompete',
    'officeDays',
    ...(inUS ? (['clearance', 'government'] as const) : []),
  ]
  return required.filter((question) => !isAnswered(question, answers))
}

/** "your résumé, a phone number and 2 more" */
export function describeMissing(missing: Question[]) {
  const names = missing.map((question) => labels[question])
  if (names.length <= 2) return names.join(' and ')
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
}

// Mock: these companies' forms run on Workday, which asks for a postal address
const WORKDAY_COMPANIES: CompanyId[] = ['meridian', 'orbital', 'kestrel', 'lumen']

/** Mock of what each job's application form asks, so readiness grows as answers come in */
function questionsFor(job: Job, inUS: boolean) {
  const asks: Question[] = ['resume', 'phone']
  if (job.seniority !== 'entry') asks.push('years')
  if (job.employment !== 'internship') asks.push('notice')
  if (job.employment === 'full-time') asks.push('nonCompete')
  if (job.workplace !== 'remote') asks.push('officeDays')
  if (WORKDAY_COMPANIES.includes(job.company)) asks.push('postalCode')
  if (inUS && job.country === 'United States') asks.push('clearance', 'government')
  return asks
}

export function isJobReady(job: Job, answers: ApplicationAnswers, inUS: boolean) {
  return questionsFor(job, inUS).every((question) => isAnswered(question, answers))
}
