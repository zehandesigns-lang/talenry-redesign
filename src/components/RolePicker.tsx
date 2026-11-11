import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { roles as suggestedRoles } from '../data/roles.ts'
import { ChevronDownIcon } from './icons.tsx'
import { inputClass } from './styles.ts'

const MAX_ROLES = 3

type RolePickerProps = {
  value: string[]
  onChange: (roles: string[]) => void
}

export function RolePicker({ value, onChange }: RolePickerProps) {
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const term = query.trim()
  const options = [...value.filter((role) => !suggestedRoles.includes(role)), ...suggestedRoles]
  const matches = options.filter((role) => role.toLowerCase().includes(term.toLowerCase()))
  const canAdd = term !== '' && !options.some((role) => role.toLowerCase() === term.toLowerCase())
  const full = value.length >= MAX_ROLES

  function toggle(role: string) {
    if (value.includes(role)) onChange(value.filter((r) => r !== role))
    else if (!full) onChange([...value, role])
  }

  function addTyped() {
    toggle(term)
    setQuery('')
  }

  function close() {
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    close()
    triggerRef.current?.focus()
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault() // Enter here shouldn't submit the form
    if (canAdd) addTyped()
    else if (matches.length === 1) toggle(matches[0])
  }

  return (
    <div
      className="relative"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <label id={`${id}-label`} htmlFor={`${id}-trigger`} className="block text-body">
        Role
      </label>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => (open ? close() : setOpen(true))}
        className={`mt-2 flex items-center justify-between gap-3 pr-5 text-left ${inputClass}`}
      >
        <span id={`${id}-value`} className={`truncate ${value.length ? '' : 'text-faint'}`}>
          {value.length ? value.join(', ') : 'Pick up to three'}
        </span>
        <ChevronDownIcon className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          tabIndex={-1}
          className="absolute inset-x-0 z-20 mt-2 rounded-xl border border-line bg-white p-2 shadow-lg outline-none"
        >
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search or add a role"
            aria-label="Search roles"
            className="h-11 w-full rounded-lg bg-track px-3 text-body outline-none placeholder:text-faint focus:ring-2 focus:ring-black/10"
          />
          <p className="px-3 pt-2.5 pb-1 text-caption text-subtle">Up to three. The first one leads.</p>
          <ul className="max-h-64 overflow-y-auto">
            {matches.map((role) => {
              const checked = value.includes(role)
              return (
                <li key={role}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-body hover:bg-track has-disabled:cursor-not-allowed has-disabled:opacity-40">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggle(role)}
                      className="size-4 shrink-0 accent-ink"
                    />
                    <span className="truncate">{role}</span>
                    {value[0] === role && (
                      <span className="ml-auto text-caption text-subtle">Leads</span>
                    )}
                  </label>
                </li>
              )
            })}
            {canAdd && (
              <li>
                <button
                  type="button"
                  onClick={addTyped}
                  disabled={full}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-body hover:bg-track disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add “{term}”
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
