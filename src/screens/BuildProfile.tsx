import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LocationCombobox } from '../components/LocationCombobox.tsx'
import { RolePicker } from '../components/RolePicker.tsx'
import { Segmented, type SegmentedOption } from '../components/Segmented.tsx'
import { SetupCard } from '../components/SetupCard.tsx'
import { primaryButtonClass } from '../components/styles.ts'
import { TextField } from '../components/TextField.tsx'
import { track } from '../lib/analytics.ts'
import { formatSalary, parseSalaryInput } from '../lib/money.ts'
import { useOnboarding, type Seniority, type Workplace } from '../onboarding.ts'

const seniorityOptions: SegmentedOption<Seniority>[] = [
  { value: 'entry', label: 'Entry', detail: '0-1 YRS' },
  { value: 'mid', label: 'Mid', detail: '1-3 YRS' },
  { value: 'senior', label: 'Senior', detail: '3-5 YRS' },
  { value: 'lead', label: 'Lead', detail: '5+ YRS' },
]

const workplaceOptions: SegmentedOption<Workplace>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-site', label: 'On-Site' },
  { value: 'hybrid', label: 'Hybrid' },
]

const yesNoOptions: SegmentedOption<'yes' | 'no'>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const toYesNo = (value: boolean | null): ('yes' | 'no')[] =>
  value === null ? [] : [value ? 'yes' : 'no']

export function BuildProfile() {
  const { profile, updateProfile, goTo } = useOnboarding()
  const [viewedAt] = useState(() => Date.now())
  const viewLogged = useRef(false)

  useEffect(() => {
    if (viewLogged.current) return // StrictMode runs effects twice in development
    viewLogged.current = true
    track('onboarding_step1_viewed')
  }, [])

  // Relocating only matters when the user would go to an office
  const asksRelocation = profile.workplace.some((place) => place !== 'remote')
  const canComplete =
    profile.roles.length > 0 &&
    profile.seniority !== null &&
    profile.location !== null &&
    profile.workplace.length > 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canComplete) return
    track('step1_completed', { secondsTaken: Math.round((Date.now() - viewedAt) / 1000) })
    goTo('matching') // a short personalised loading screen, then the dashboard
  }

  return (
    <SetupCard
      title="Build your profile"
      step="Step 2/2"
      onBack={() => goTo('account')}
      className="max-w-177.5"
    >
      <form onSubmit={handleSubmit} className="mt-8 sm:mt-8.5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2.5">
          <RolePicker value={profile.roles} onChange={(roles) => updateProfile({ roles })} />
          <TextField
            label="Minimum salary"
            inputMode="numeric"
            placeholder="Optional"
            value={profile.minSalary === null ? '' : formatSalary(profile.minSalary, profile.location?.country)}
            onChange={(event) => updateProfile({ minSalary: parseSalaryInput(event.target.value) })}
          />
        </div>

        <Segmented
          label="Seniority"
          className="mt-6"
          options={seniorityOptions}
          selected={profile.seniority ? [profile.seniority] : []}
          onChange={([seniority]) => updateProfile({ seniority })}
          trackClassName="grid grid-cols-2 sm:flex sm:justify-between"
          optionClassName="flex-col gap-0 py-2 sm:flex-row sm:gap-3 sm:py-0"
        />

        <LocationCombobox
          className="mt-6 sm:max-w-121.5"
          value={profile.location}
          onChange={(location) => updateProfile({ location })}
        />

        <Segmented
          label="Workplace"
          className="mt-6"
          options={workplaceOptions}
          selected={profile.workplace}
          onChange={([workplace]) => updateProfile({ workplace: [workplace] })}
          trackClassName="grid grid-cols-3 sm:inline-flex"
        />

        <div className="mt-6 flex flex-wrap gap-x-16 gap-y-6">
          {asksRelocation && (
            <Segmented
              label="Open to relocating"
              options={yesNoOptions}
              selected={toYesNo(profile.openToRelocating)}
              onChange={([answer]) => updateProfile({ openToRelocating: answer === 'yes' })}
            />
          )}
          <Segmented
            label="Need visa sponsorship?"
            options={yesNoOptions}
            selected={toYesNo(profile.needsVisa)}
            onChange={([answer]) => updateProfile({ needsVisa: answer === 'yes' })}
          />
        </div>

        <button type="submit" disabled={!canComplete} className={`mt-9 ${primaryButtonClass}`}>
          Complete
        </button>
      </form>
    </SetupCard>
  )
}
