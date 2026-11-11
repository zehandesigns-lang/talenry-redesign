import { companies, jobs, type Job } from '../data/jobs.ts'
import type { OnboardingState, Seniority } from '../onboarding.ts'

/**
 * How much more likely an interview is when the user also emails the hiring manager.
 * Illustrative only: no published study measures this. Swap in Talenry's own data before quoting it.
 */
export const OUTREACH_INTERVIEW_LIFT = '2×'

/** Backlinko's study of 12 million outreach emails: one follow-up got 65.8% more replies */
export const FOLLOW_UP_LIFT = '65.8%'
export const FOLLOW_UP_SOURCE = {
  label: 'Backlinko’s study of 12 million outreach emails',
  url: 'https://backlinko.com/email-outreach-study',
}

export type HiringManager = { firstName: string; lastName: string; title: string; email: string }

export type Attachment = { kind: 'resume' | 'cover-letter'; name: string; size: string }

export type OutreachEmail = {
  job: Job
  manager: HiringManager
  subject: string
  body: string
  attachments: Attachment[]
  sent: boolean
  /** When it went out, once sent */
  sentAt: number | null
}

// One first and one last name per job, so no two hiring managers share either
const FIRST_NAMES = [
  'Maya', 'Daniel', 'Priya', 'Tom', 'Aisha', 'Leo', 'Hannah', 'Kenji', 'Sofia', 'Marcus', 'Elena', 'Ravi', 'Grace', 'Omar', 'Nina', 'Samuel',
  'Chloe', 'Arjun', 'Fatima', 'Lucas', 'Mei', 'Jonah', 'Zara', 'Diego', 'Ingrid', 'Kwame', 'Lena', 'Rohan', 'Amara', 'Felix', 'Yuki', 'Noor',
]
const LAST_NAMES = [
  'Chen', 'Okafor', 'Sharma', 'Becker', 'Rahman', 'Moreau', 'Kim', 'Alvarez', 'Patel', 'Nguyen', 'Fischer', 'Mensah', 'Rossi', 'Haddad', 'Silva', 'Walsh',
  'Iyer', 'Novak', 'Tanaka', 'Brennan', 'Costa', 'Lindqvist', 'Adeyemi', 'Kowalski', 'Reyes', 'Hughes', 'Bose', 'Larsen', 'Dubois', 'Osei', 'Kapoor', 'Morgan',
]

/** Who usually hires for a role, matched on the job title (most specific first) */
const MANAGER_TITLES: [RegExp, string][] = [
  [/intern/i, 'Design Manager'],
  [/lead product designer/i, 'Chief Product Officer'],
  [/ux writer/i, 'Content Design Lead'],
  // Companies hiring two designers have a lead per team, not two heads of design
  [/designer, platform/i, 'Design Lead, Platform'],
  [/designer, ai/i, 'Design Lead, AI'],
  [/contract/i, 'Design Manager'],
  [/design/i, 'Head of Design'],
  [/research/i, 'Head of Research'],
  [/evaluation/i, 'Research Lead'],
  [/engineering manager/i, 'VP of Engineering'],
  [/product manager/i, 'Director of Product'],
  [/data scientist|machine learning/i, 'Head of Data Science'],
  [/engineer/i, 'Engineering Manager'],
  [/analyst/i, 'Analytics Lead'],
  [/growth/i, 'Head of Growth'],
  [/program/i, 'Director of Operations'],
]

/** One line per role on why it appeals, so no two emails read the same */
const HOOKS: Record<string, string> = {
  'parallel-senior-ux': 'Planning patient visits for study teams is exactly the kind of complex, high-stakes flow I like untangling.',
  'northwind-product-designer': 'Tools that dispatchers use every hour are my favourite kind of product, where small design decisions add up fast.',
  'lumen-ai-pm': 'Working with doctors on what a good clinical note looks like is a problem I’d love to own.',
  'prism-eval': 'Writing rubrics and digging into the edge cases of reasoning models is work I find genuinely interesting.',
  'kestrel-data-pm': 'Pricing climate risk matters, and the data products underwriters rely on every day are where I’d like to help.',
  'cobalt-frontend': 'A real-time energy dashboard full of charts that have to stay fast sounds like a great challenge.',
  'fieldnote-research': 'Research with field scientists, from diary studies to site visits, is exactly what I want to do more of.',
  'tidepool-senior-designer': 'Shaping onboarding and invoicing for 400,000 freelancers is the kind of scale I’d love to design for.',
  'orbital-ml': 'Serving the models that route satellite imagery at scale is a problem I’d be excited to work on.',
  'saffron-pm': 'Owning checkout for small merchants, from QR codes to settlements, is a product I’d love to help shape.',
  'meridian-analyst': 'Finding the patterns behind late payments is the kind of analysis I enjoy most.',
  'juniper-designer': 'Designing offline-first flows for growers on low-end phones is a problem I really care about.',
  'lumen-designer-ai': 'How clinicians review and correct AI-written notes is exactly where I want to spend my time.',
  'prism-tpm': 'A developer platform where you talk to customers every week is the kind of role I’m looking for.',
  'northwind-em': 'Leading a team that builds route planning while the product grows is a challenge I’d welcome.',
  'kestrel-data-scientist': 'Modelling flood and wildfire risk is meaningful work, and the mix of Bayesian methods and clear writing appeals to me.',
  'cobalt-designer': 'Turning dense sensor data into decisions people can make in a minute is my favourite kind of design problem.',
  'tidepool-growth': 'Running experiments across signup and activation, alongside design and data, is how I like to work.',
  'orbital-program': 'Coordinating launches across hardware and software teams is where I think I could make a real difference.',
  'saffron-research': 'Learning how merchants across Karnataka take payments is research I’d love to do.',
  'fieldnote-fullstack': 'Apps that work offline are a real interest of mine, and a sync engine is the best place to work on them.',
  'meridian-pm-lending': 'Halving approval time for small-business loans is a goal I’d be excited to work towards.',
  'juniper-analyst': 'Improving planting advice with crop and weather data is work I’d find meaningful.',
  'parallel-platform-designer': 'A study-builder platform full of complex forms is exactly the kind of systems problem I enjoy.',
  'lumen-ux-writer': 'Writing the words clinicians rely on, from error states to onboarding, is work I care about.',
  'prism-design-intern': 'Shipping real features on the playground team with a senior mentor is the start I’m hoping for.',
  'kestrel-lead-designer': 'Building a design team and setting the bar for craft is the next step I’m looking for.',
  'cobalt-ai-pm': 'Bringing forecasting and anomaly detection into a product people use every day is a problem I’d love to own.',
  'orbital-data-pm': 'A product where data quality is the product is one I’d really enjoy owning.',
  'tidepool-contract-designer': 'Fast iterations with weekly user tests is how I like to work, and invoicing is a great place for it.',
  'saffron-data-scientist': 'Fraud models for millions of daily UPI payments is a scale I’d be excited to work at.',
  'meridian-senior-ux': 'Arabic and English interfaces with right-to-left done properly is a craft challenge I’d enjoy.',
}

const seniorityWords: Record<Seniority, string> = {
  entry: 'junior',
  mid: '',
  senior: 'senior',
  lead: 'lead',
}

const jobById = new Map(jobs.map((job) => [job.id, job]))
const jobIndex = new Map(jobs.map((job, i) => [job.id, i]))

/** Small, stable hash so each job always gets the same mock manager and subject line */
function hash(text: string) {
  let value = 5381
  for (const char of text) value = (value * 33 + char.charCodeAt(0)) >>> 0
  return value
}

const article = (word: string) => (/^[aeio]/i.test(word) || /^u(?!x|ni|se)/i.test(word) ? 'an' : 'a')

export function hiringManagerFor(job: Job): HiringManager {
  const i = jobIndex.get(job.id) ?? hash(job.id)
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
  // 11 shares no factor with 32, so this walks every last name once
  const lastName = LAST_NAMES[(i * 11 + 5) % LAST_NAMES.length]
  // The reserved .example domain: a copied mock address can never reach a real inbox
  const domain = `${companies[job.company].toLowerCase().replace(/[^a-z0-9]/g, '')}.example`
  return {
    firstName,
    lastName,
    title: MANAGER_TITLES.find(([pattern]) => pattern.test(job.title))?.[1] ?? 'Hiring Manager',
    email: `${firstName}.${lastName}@${domain}`.toLowerCase(),
  }
}

type DraftContext = Pick<OnboardingState, 'account' | 'profile' | 'application'>

const fileSize = (seed: string, min: number, spread: number) => `${min + (hash(seed) % spread)} KB`

/** Every email carries the résumé and a cover letter written for that company */
export function attachmentsFor(job: Job, { account, application }: DraftContext): Attachment[] {
  const person = [account.firstName, account.lastName].map((part) => part.trim()).filter(Boolean).join('-') || 'My'
  const resume = application.resumeName ?? `${person}-Resume.pdf`
  const company = companies[job.company].replace(/\s+/g, '')
  return [
    { kind: 'resume', name: resume, size: fileSize(resume, 140, 90) },
    { kind: 'cover-letter', name: `${person}-Cover-Letter-${company}.pdf`, size: fileSize(job.id, 38, 30) },
  ]
}

/** A line about the sender, from their résumé when there is one, else from onboarding */
function aboutMe({ profile, application }: DraftContext) {
  const role = application.experience.find((entry) => entry.current) ?? application.experience[0]
  if (role?.title.trim() && role.company.trim()) {
    const years = application.yearsExperience
    return role.current
      ? `I’m currently ${article(role.title)} ${role.title} at ${role.company}${years ? `, with ${years} years in the field` : ''}.`
      : `Most recently, I was ${article(role.title)} ${role.title} at ${role.company}.`
  }
  const level = profile.seniority ? seniorityWords[profile.seniority] : ''
  const title = [level, profile.roles[0] ?? 'designer'].filter(Boolean).join(' ')
  const city = profile.location?.name
  return `I’m ${article(title)} ${title}${city ? ` based in ${city}` : ''}.`
}

/** The agent's draft: short, specific to the role, signed by the user */
export function draftEmail(job: Job, manager: HiringManager, context: DraftContext) {
  const company = companies[job.company]
  const { firstName, lastName } = context.account
  const subjects = [`${job.title} role: a quick hello`, `Just applied: ${job.title}`, `About the ${job.title} role`]
  const hook = HOOKS[job.id] ?? `The ${job.title} role is the kind of work I want to do next.`
  return {
    subject: subjects[hash(`${job.id}-subject`) % subjects.length],
    body: [
      `Hi ${manager.firstName},`,
      `I’ve just applied for the ${job.title} role at ${company} and wanted to say hello directly. ${hook}`,
      `${aboutMe(context)} I’d love to bring that to your team. I’ve attached my résumé and a cover letter for the role.`,
      'Would you be open to a 15-minute call in the next couple of weeks? I’m happy to share more of my work.',
      `Best,\n${[firstName, lastName].filter(Boolean).join(' ')}`,
    ].join('\n\n'),
  }
}

/** One email per job the agent has applied to, with any edits the user made */
export function outreachEmails(
  state: Pick<OnboardingState, 'account' | 'profile' | 'application' | 'applications' | 'outreach'>,
): OutreachEmail[] {
  return state.applications.flatMap(({ jobId, status }) => {
    const job = jobById.get(jobId)
    if (!job || status !== 'sent') return [] // only write once the application is in
    const manager = hiringManagerFor(job)
    const draft = state.outreach.edits[jobId] ?? draftEmail(job, manager, state)
    const sent = state.outreach.sentJobIds.includes(jobId)
    return [
      {
        job,
        manager,
        ...draft,
        attachments: attachmentsFor(job, state),
        sent,
        sentAt: sent ? (state.outreach.sentAt[jobId] ?? null) : null,
      },
    ]
  })
}
