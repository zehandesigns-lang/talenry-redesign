import { companies, jobs, type CompanyId } from '../data/jobs.ts'

// Mock: these companies' forms ask a free-text question the agent drafts but won't send unchecked
const DRAFTS: Partial<Record<CompanyId, string>> = {
  lumen:
    'I want to help clinicians spend less time on notes and more with patients. I’ve designed dense B2B workflows and would bring that care to Lumen’s assistant.',
  kestrel:
    'Climate risk is the problem I most want to work on. I’ve built data-heavy tools for experts, and Kestrel’s underwriting products are a natural next step.',
  saffron:
    'Saffron builds for the small merchants I grew up around. I like products where every second saved matters, and payments is exactly that.',
}

/** The question the agent pauses on for this job, with its draft answer; null when the form is routine */
export function reviewFor(jobId: string) {
  const job = jobs.find((j) => j.id === jobId)
  const draft = job ? DRAFTS[job.company] : undefined
  return job && draft ? { question: `Why do you want to work at ${companies[job.company]}?`, draft } : null
}

/** How long filling one form takes: 1.8–3.2s, fixed per job so a reload doesn't reshuffle it */
export function fillDuration(jobId: string) {
  let hash = 0
  for (const char of jobId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return 1800 + (hash % 1400)
}
