import { CalendarDays, CircleDollarSign, Layers, MapPin, Rocket, Search, Trophy } from 'lucide-react'
import type { EmploymentType } from '../data/jobs.ts'
import { clearedFilters, type JobFilters } from '../lib/jobs.ts'
import type { Seniority, Workplace } from '../onboarding.ts'
import { FilterMenu, type FilterOption } from './FilterMenu.tsx'
import { WorkplaceIcon } from './icons.tsx'
import { focusRing } from './styles.ts'

const postedOptions: FilterOption<string>[] = [
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
]

const employmentOptions: FilterOption<EmploymentType>[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const workplaceOptions: FilterOption<Workplace>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
]

const seniorityOptions: FilterOption<Seniority>[] = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
]

const payOptions: FilterOption<string>[] = [
  { value: '25000', label: '$25k+' },
  { value: '50000', label: '$50k+' },
  { value: '100000', label: '$100k+' },
  { value: '150000', label: '$150k+' },
]

const travelOptions: FilterOption<string>[] = [
  { value: '0', label: 'No travel' },
  { value: '25', label: 'Up to 25%' },
  { value: '50', label: 'Up to 50%' },
]

const toList = (value: number | null) => (value === null ? [] : [String(value)])
const fromList = ([value]: string[]) => (value === undefined ? null : Number(value))

type JobFilterBarProps = {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  countries: string[]
  className?: string
}

export function JobFilterBar({ filters, onChange, countries, className = '' }: JobFilterBarProps) {
  const set = (changes: Partial<JobFilters>) => onChange({ ...filters, ...changes })
  const isClear = JSON.stringify(filters) === JSON.stringify(clearedFilters)

  return (
    // Sits on the page like the listings below it: outlined controls, a rule to close the section
    <section aria-label="Search and filters" className={`border-b border-divider pb-6 ${className}`}>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor="job-search" className="sr-only">
          Search by job title
        </label>
        <Search
          aria-hidden="true"
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-meta"
        />
        <input
          id="job-search"
          type="search"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          placeholder="Search by job title"
          className="h-12.5 w-full rounded-lg border border-control bg-white pr-4 pl-11.5 text-ui outline-none transition-[border-color,box-shadow] placeholder:text-soft focus:border-ink focus:ring-3 focus:ring-black/8"
        />
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterMenu
          label="Date posted"
          icon={<CalendarDays strokeWidth={1.75} />}
          options={postedOptions}
          selected={toList(filters.postedWithinDays)}
          onChange={(value) => set({ postedWithinDays: fromList(value) })}
          anyLabel="Any time"
        />
        <FilterMenu
          label="Job type"
          icon={<Layers strokeWidth={1.75} />}
          options={employmentOptions}
          selected={filters.employment}
          onChange={(employment) => set({ employment })}
          multiple
        />
        <FilterMenu
          label="Workplace"
          icon={<WorkplaceIcon />}
          options={workplaceOptions}
          selected={filters.workplace}
          onChange={(workplace) => set({ workplace })}
          multiple
        />
        <FilterMenu
          label="Location"
          icon={<MapPin strokeWidth={1.75} />}
          options={countries.map((country) => ({ value: country, label: country }))}
          selected={filters.countries}
          onChange={(picked) => set({ countries: picked })}
          multiple
        />
        <FilterMenu
          label="Seniority"
          icon={<Trophy strokeWidth={1.75} />}
          options={seniorityOptions}
          selected={filters.seniority}
          onChange={(seniority) => set({ seniority })}
          multiple
        />
        <FilterMenu
          label="Pay"
          icon={<CircleDollarSign strokeWidth={1.75} />}
          options={payOptions}
          selected={toList(filters.minPayUsd)}
          onChange={(value) => set({ minPayUsd: fromList(value) })}
          anyLabel="Any pay"
        />
        <FilterMenu
          label="Travel"
          icon={<Rocket strokeWidth={1.75} />}
          options={travelOptions}
          selected={toList(filters.maxTravel)}
          onChange={(value) => set({ maxTravel: fromList(value) })}
          anyLabel="Any amount"
        />
        <button
          type="button"
          onClick={() => onChange(clearedFilters)}
          disabled={isClear}
          className={`rounded-md px-2 py-2 text-ui font-medium text-meta transition-colors hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:text-meta ${focusRing}`}
        >
          Clear all
        </button>
      </div>
    </section>
  )
}
