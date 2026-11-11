import { ChevronDown, LoaderCircle, Plus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent, type SelectHTMLAttributes } from 'react'
import { readMockResume } from '../data/mockResume.ts'
import { track } from '../lib/analytics.ts'
import { monthOptions, newRole, newSchool, yearOptions } from '../lib/resume.ts'
import { useOnboarding, type EducationEntry, type ExperienceEntry, type ExperienceType } from '../onboarding.ts'
import { LinkedInShotAnimation } from './LinkedInShotAnimation.tsx'
import { SelectField } from './SelectField.tsx'
import { focusRing, inputClass } from './styles.ts'
import { TextField } from './TextField.tsx'

const typeOptions: { value: ExperienceType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
]

const pastYears = yearOptions()
const yearsWithFuture = yearOptions(6) // expected graduation can be ahead

// Plain cards, so the tinted LinkedIn shortcut above them is the one that draws the eye
const cardClass = 'rounded-xl border border-chip-line bg-white p-4 sm:p-5'
const cardLabel = 'text-xs leading-[normal] font-bold tracking-[0.1em] text-[#706e73] uppercase'
const linkButton = `rounded text-ui-sm font-semibold text-nav underline-offset-4 hover:underline ${focusRing}`
const addButton = `mt-4 flex items-center gap-2 rounded-lg border border-ink bg-white px-4 py-2.5 text-ui font-semibold transition-colors hover:bg-black/5 ${focusRing}`
const twoColumns = 'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-2.5'

/** A select without its own label, for month/year pairs under one legend */
function BareSelect({
  placeholder,
  options,
  ...props
}: { placeholder: string; options: { value: string; label: string }[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative min-w-0 flex-1">
      <select {...props} className={`${inputClass} appearance-none pr-10 disabled:bg-track disabled:text-faint`}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
      />
    </div>
  )
}

function MonthYear({
  legend,
  month,
  year,
  years,
  disabled = false,
  onMonth,
  onYear,
}: {
  legend: string
  month: string
  year: string
  years: { value: string; label: string }[]
  disabled?: boolean
  onMonth: (month: string) => void
  onYear: (year: string) => void
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-body">{legend}</legend>
      <div className="mt-2 flex gap-2">
        <BareSelect
          aria-label={`${legend} month`}
          placeholder="Month"
          options={monthOptions}
          value={month}
          onChange={(event) => onMonth(event.target.value)}
        />
        <BareSelect
          aria-label={`${legend} year`}
          placeholder="Year"
          options={years}
          value={year}
          onChange={(event) => onYear(event.target.value)}
        />
      </div>
    </fieldset>
  )
}

function RoleCard({
  role,
  index,
  onChange,
  onRemove,
}: {
  role: ExperienceEntry
  index: number
  onChange: (changes: Partial<ExperienceEntry>) => void
  onRemove: () => void
}) {
  const id = useId()

  return (
    <li className={cardClass}>
      <div className="flex items-center justify-between">
        <p className={cardLabel}>Role {index + 1}</p>
        <button type="button" onClick={onRemove} className={linkButton}>
          Remove
        </button>
      </div>
      <div className={`mt-3 ${twoColumns}`}>
        <TextField
          label="Job title"
          placeholder="Product Designer"
          value={role.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
        <TextField
          label="Company"
          value={role.company}
          onChange={(event) => onChange({ company: event.target.value })}
        />
        <TextField
          label="Location"
          placeholder="City, or Remote"
          value={role.location}
          onChange={(event) => onChange({ location: event.target.value })}
        />
        <SelectField
          label="Type"
          placeholder="Choose one"
          options={typeOptions}
          value={role.type}
          onChange={(event) => onChange({ type: (event.target.value || 'full-time') as ExperienceType })}
        />
        <MonthYear
          legend="Start"
          month={role.startMonth}
          year={role.startYear}
          years={pastYears}
          onMonth={(startMonth) => onChange({ startMonth })}
          onYear={(startYear) => onChange({ startYear })}
        />
        <div>
          <MonthYear
            legend="End"
            month={role.current ? '' : role.endMonth}
            year={role.current ? '' : role.endYear}
            years={pastYears}
            disabled={role.current}
            onMonth={(endMonth) => onChange({ endMonth })}
            onYear={(endYear) => onChange({ endYear })}
          />
          <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-ui-sm text-nav">
            <input
              type="checkbox"
              checked={role.current}
              onChange={(event) => onChange({ current: event.target.checked })}
              className="size-4 accent-ink"
            />
            I work here now
          </label>
        </div>
      </div>
      <label htmlFor={`${id}-description`} className="mt-5 block text-body">
        Responsibilities and achievements
      </label>
      <textarea
        id={`${id}-description`}
        rows={3}
        value={role.description}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder="What you owned, shipped or improved. Numbers help."
        className="mt-2 block min-h-28 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-body outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-ink focus:ring-3 focus:ring-black/8"
      />
    </li>
  )
}

function SchoolCard({
  school,
  index,
  onChange,
  onRemove,
}: {
  school: EducationEntry
  index: number
  onChange: (changes: Partial<EducationEntry>) => void
  onRemove: () => void
}) {
  return (
    <li className={cardClass}>
      <div className="flex items-center justify-between">
        <p className={cardLabel}>School {index + 1}</p>
        <button type="button" onClick={onRemove} className={linkButton}>
          Remove
        </button>
      </div>
      <div className={`mt-3 ${twoColumns}`}>
        <TextField
          className="sm:col-span-2"
          label="School"
          value={school.school}
          onChange={(event) => onChange({ school: event.target.value })}
        />
        <TextField
          label="Degree"
          placeholder="Bachelor of Design"
          value={school.degree}
          onChange={(event) => onChange({ degree: event.target.value })}
        />
        <TextField
          label="Field of study"
          value={school.field}
          onChange={(event) => onChange({ field: event.target.value })}
        />
        <SelectField
          label="Start year"
          placeholder="Year"
          options={pastYears}
          value={school.startYear}
          onChange={(event) => onChange({ startYear: event.target.value })}
        />
        <SelectField
          label="End year (or expected)"
          placeholder="Year"
          options={yearsWithFuture}
          value={school.endYear}
          onChange={(event) => onChange({ endYear: event.target.value })}
        />
      </div>
    </li>
  )
}

/** Everything a résumé holds, typed in or read from LinkedIn screenshots */
export function ManualResumeForm() {
  const { application, updateApplication } = useOnboarding()
  const { experience, education, skills } = application
  const shotsRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const skillsId = useId()
  const [readingShots, setReadingShots] = useState(0)
  const [filledFromShots, setFilledFromShots] = useState(0)
  const [skillDraft, setSkillDraft] = useState('')

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setRole = (id: string, changes: Partial<ExperienceEntry>) =>
    updateApplication({ experience: experience.map((role) => (role.id === id ? { ...role, ...changes } : role)) })
  const setSchool = (id: string, changes: Partial<EducationEntry>) =>
    updateApplication({ education: education.map((school) => (school.id === id ? { ...school, ...changes } : school)) })

  function handleShots(event: ChangeEvent<HTMLInputElement>) {
    const count = event.target.files?.length ?? 0
    event.target.value = ''
    if (!count) return
    setReadingShots(count)
    // Mock reading: a short pause, then fill whatever is still empty
    timer.current = window.setTimeout(() => {
      const found = readMockResume()
      const keptRoles = experience.filter((role) => role.title.trim() || role.company.trim())
      const keptSchools = education.filter((school) => school.school.trim())
      updateApplication({
        experience: keptRoles.length ? keptRoles : found.experience,
        education: keptSchools.length ? keptSchools : found.education,
        skills: skills.length ? skills : found.skills,
      })
      setReadingShots(0)
      setFilledFromShots(count)
      track('linkedin_screenshots_uploaded', { count })
    }, 1400)
  }

  function addSkill() {
    const skill = skillDraft.trim()
    if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      updateApplication({ skills: [...skills, skill] })
    }
    setSkillDraft('')
  }

  return (
    <>
      <section
        aria-labelledby={`${skillsId}-linkedin`}
        className="flex flex-col gap-5 rounded-xl border border-sidebar-line bg-sidebar p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
      >
        <LinkedInShotAnimation className="w-full max-w-64 shrink-0 self-center rounded-lg bg-white sm:w-60" />
        <div className="min-w-0">
          <h3 id={`${skillsId}-linkedin`} className="text-body font-semibold">
            Faster: upload LinkedIn screenshots
          </h3>
          <p className="mt-1.5 text-ui-sm text-subtle">
            Screenshot your experience, skills and education from LinkedIn and upload them here.
          </p>
          <div aria-live="polite" className="mt-4">
            {readingShots > 0 ? (
              <p className="flex items-center gap-2.5 text-ui text-nav">
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                Reading {readingShots === 1 ? 'your screenshot' : `${readingShots} screenshots`}…
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => shotsRef.current?.click()}
                  className={`rounded-lg border border-ink bg-white px-4 py-2.5 text-ui font-semibold transition-colors hover:bg-black/5 ${focusRing}`}
                >
                  Upload screenshots
                </button>
                {filledFromShots > 0 && (
                  <p className="text-ui-sm text-subtle">
                    Filled from {filledFromShots === 1 ? 'your screenshot' : `${filledFromShots} screenshots`}. Check
                    and edit below.
                  </p>
                )}
              </div>
            )}
          </div>
          <input ref={shotsRef} type="file" accept="image/*" multiple onChange={handleShots} className="hidden" />
        </div>
      </section>

      <section aria-labelledby={`${skillsId}-experience`} className="mt-8">
        <h3 id={`${skillsId}-experience`} className="text-body font-semibold">
          Work experience
        </h3>
        <ul className="mt-3 flex flex-col gap-4">
          {experience.map((role, i) => (
            <RoleCard
              key={role.id}
              role={role}
              index={i}
              onChange={(changes) => setRole(role.id, changes)}
              onRemove={() => updateApplication({ experience: experience.filter((r) => r.id !== role.id) })}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => updateApplication({ experience: [...experience, newRole()] })}
          className={addButton}
        >
          <Plus aria-hidden="true" strokeWidth={2} className="size-4" />
          Add {experience.length ? 'another role' : 'a role'}
        </button>
      </section>

      <section aria-labelledby={`${skillsId}-education`} className="mt-8">
        <h3 id={`${skillsId}-education`} className="text-body font-semibold">
          Education
        </h3>
        {education.length > 0 && (
          <ul className="mt-3 flex flex-col gap-4">
            {education.map((school, i) => (
              <SchoolCard
                key={school.id}
                school={school}
                index={i}
                onChange={(changes) => setSchool(school.id, changes)}
                onRemove={() => updateApplication({ education: education.filter((s) => s.id !== school.id) })}
              />
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => updateApplication({ education: [...education, newSchool()] })}
          className={addButton}
        >
          <Plus aria-hidden="true" strokeWidth={2} className="size-4" />
          Add {education.length ? 'another school' : 'a school'}
        </button>
      </section>

      <section className="mt-8">
        <label htmlFor={`${skillsId}-skill`} className="block text-body font-semibold">
          Skills
        </label>
        <div className="mt-3 flex gap-2.5">
          <input
            id={`${skillsId}-skill`}
            value={skillDraft}
            onChange={(event) => setSkillDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault()
                addSkill()
              }
            }}
            placeholder="Add a skill and press Enter"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={addSkill}
            className={`shrink-0 rounded-lg border border-line bg-white px-5 text-ui font-semibold transition-colors hover:bg-black/5 ${focusRing}`}
          >
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <ul aria-label="Your skills" className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill} className="flex items-center gap-1 rounded-lg bg-tag py-1.5 pr-1.5 pl-3 text-ui-sm">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => updateApplication({ skills: skills.filter((s) => s !== skill) })}
                  className={`grid size-6 place-items-center rounded-md text-meta hover:bg-black/5 ${focusRing}`}
                >
                  <X aria-hidden="true" strokeWidth={2} className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
