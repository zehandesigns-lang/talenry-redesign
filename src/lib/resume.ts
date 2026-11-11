import type { ApplicationAnswers, EducationEntry, ExperienceEntry } from '../onboarding.ts'

type ResumeDetails = Pick<ApplicationAnswers, 'experience' | 'education' | 'skills'>

const thisYear = new Date().getFullYear()

export const monthOptions = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
  (label, i) => ({ value: String(i + 1).padStart(2, '0'), label }),
)

/** Newest first; `ahead` adds future years for expected graduation */
export function yearOptions(ahead = 0) {
  return Array.from({ length: 46 + ahead }, (_, i) => String(thisYear + ahead - i)).map((year) => ({
    value: year,
    label: year,
  }))
}

export function isCompleteRole(role: ExperienceEntry) {
  return Boolean(
    role.title.trim() &&
      role.company.trim() &&
      role.startMonth &&
      role.startYear &&
      (role.current || (role.endMonth && role.endYear)),
  )
}

/** Same bar as the old onboarding: one job, school or skill is enough to start */
export function hasResumeDetails({ experience, education, skills }: ResumeDetails) {
  return experience.some(isCompleteRole) || education.some((school) => school.school.trim()) || skills.length > 0
}

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** "2 roles, 1 school and 6 skills" */
export function describeResume({ experience, education, skills }: ResumeDetails) {
  const parts = [
    count(experience.filter(isCompleteRole).length, 'role'),
    count(education.filter((school) => school.school.trim()).length, 'school'),
    count(skills.length, 'skill'),
  ]
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** Whole years since the earliest role started */
export function yearsOfExperience(experience: ExperienceEntry[], now = new Date()) {
  const starts = experience
    .filter(isCompleteRole)
    .map((role) => new Date(Number(role.startYear), Number(role.startMonth) - 1).getTime())
  if (!starts.length) return null
  return Math.max(0, Math.floor((now.getTime() - Math.min(...starts)) / (365.25 * 24 * 60 * 60 * 1000)))
}

export const newRole = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  current: false,
  description: '',
})

export const newSchool = (): EducationEntry => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
})
