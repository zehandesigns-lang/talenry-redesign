import { useId, useState, type KeyboardEvent } from 'react'
import { cities, formatCity, type City } from '../data/cities.ts'
import { inputClass } from './styles.ts'

const MAX_SUGGESTIONS = 8

type LocationComboboxProps = {
  value: City | null
  onChange: (city: City | null) => void
  className?: string
}

export function LocationCombobox({ value, onChange, className = '' }: LocationComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState(value ? formatCity(value) : '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [shownValue, setShownValue] = useState(value)

  // The prototype controls can swap the city from outside; keep the text in step
  if (value !== shownValue) {
    setShownValue(value)
    if (value) setQuery(formatCity(value))
  }

  const term = query.trim().toLowerCase()
  const matches = cities
    .filter((city) => formatCity(city).toLowerCase().includes(term))
    .slice(0, MAX_SUGGESTIONS)
  const expanded = open && matches.length > 0

  function select(city: City) {
    onChange(city)
    setQuery(formatCity(city))
    setOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (expanded) setActive((i) => Math.min(i + 1, matches.length - 1))
      else setOpen(true)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter' && expanded) {
      event.preventDefault()
      select(matches[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="block text-body">
        Location
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Where do you live right now"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
          if (value) onChange(null) // typing again clears the picked city
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className={`mt-2 ${inputClass}`}
      />
      {expanded && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Cities"
          className="absolute inset-x-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg"
        >
          {matches.map((city, i) => (
            <li
              key={formatCity(city)}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(event) => event.preventDefault()} // keep focus in the input
              onMouseEnter={() => setActive(i)}
              onClick={() => select(city)}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-body ${i === active ? 'bg-track' : ''}`}
            >
              {city.name}
              <span className="text-subtle">, {city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
