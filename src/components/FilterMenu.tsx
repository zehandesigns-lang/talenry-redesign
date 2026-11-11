import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { focusRing } from './styles.ts'

export type FilterOption<T extends string> = { value: T; label: string }

type FilterMenuProps<T extends string> = {
  /** Names the filter: on the chip while nothing is picked, and atop the menu */
  label: string
  icon: ReactNode
  options: FilterOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  multiple?: boolean
  /** Single-choice menus get this option to clear the filter */
  anyLabel?: string
}

/** In rem, so the menu scales with the rest of the board */
const MENU_WIDTH = 19.5

const rowClass = (checked: boolean) =>
  `relative flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-ui transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-ink ${
    checked ? 'bg-selected font-semibold' : 'hover:bg-sidebar'
  }`

/**
 * A filter chip and its menu. While a filter is on, the chip turns black and gains a × to clear it.
 */
export function FilterMenu<T extends string>({
  label,
  icon,
  options,
  selected,
  onChange,
  multiple = false,
  anyLabel,
}: FilterMenuProps<T>) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  /** Single-choice menus close on a click but stay open while arrow keys move the choice */
  const pickedByPointer = useRef(false)
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)

  const picked = options.filter((option) => selected.includes(option.value))
  const active = picked.length > 0
  const summary =
    picked.length === 0 ? label : picked.length === 1 ? picked[0].label : `${picked[0].label} +${picked.length - 1}`

  // Clicks elsewhere close the menu (Safari doesn't focus buttons on click, so blur alone misses them)
  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function toggleOpen() {
    const rect = triggerRef.current?.getBoundingClientRect()
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    if (rect) setAlignRight(rect.left + MENU_WIDTH * rem > window.innerWidth - 16)
    setOpen((o) => !o)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function pick(values: T[]) {
    onChange(values)
    if (!multiple && pickedByPointer.current) close()
  }

  function toggle(value: T) {
    if (!multiple) pick([value])
    else onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  /** Clicking the choice that's already on just closes a single-choice menu */
  function closeIfUnchanged(checked: boolean) {
    if (!multiple && checked && pickedByPointer.current) close()
  }

  function clear() {
    onChange([])
    setOpen(false)
    triggerRef.current?.focus() // the × goes away with the filter
  }

  function handleKeyDown(event: KeyboardEvent) {
    pickedByPointer.current = false
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    close()
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        pickedByPointer.current = true
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <div
        className={`flex h-10 items-center rounded-lg border transition-colors ${
          active ? 'border-ink bg-ink text-white' : 'border-control bg-white text-nav-active hover:bg-sidebar'
        }`}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-menu`}
          onClick={toggleOpen}
          className={`flex h-full items-center gap-2 rounded-lg text-ui font-medium whitespace-nowrap ${
            active ? 'pr-1 pl-3.5' : 'px-3.5'
          } ${focusRing}`}
        >
          {active ? (
            <span className="sr-only">{label}: </span>
          ) : (
            <span aria-hidden="true" className="text-nav [&>svg]:size-4.5">
              {icon}
            </span>
          )}
          {summary}
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className={`size-4 transition-transform ${active ? 'text-white/70' : 'text-meta'} ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {active && (
          <button
            type="button"
            onClick={clear}
            aria-label={`Clear the ${label.toLowerCase()} filter`}
            className={`mr-1 grid size-7.5 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/15 hover:text-white ${focusRing}`}
          >
            <X aria-hidden="true" strokeWidth={2} className="size-4" />
          </button>
        )}
      </div>

      {open && (
        <div
          id={`${id}-menu`}
          role="group"
          aria-labelledby={`${id}-heading`}
          // Focusable, so pressing a row moves focus here rather than out of the menu (which would close it)
          tabIndex={-1}
          style={{ width: `${MENU_WIDTH}rem` }}
          className={`absolute z-30 mt-2 max-w-[calc(100vw-2rem)] rounded-xl border border-chip-line bg-white p-2 shadow-lg outline-none ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          <p
            id={`${id}-heading`}
            className="px-3 pt-2 pb-2.5 font-mono text-caption tracking-[0.14em] text-meta uppercase"
          >
            {label}
          </p>
          {!multiple && anyLabel && (
            <label className={rowClass(!active)} onClick={() => closeIfUnchanged(!active)}>
              <input
                type="radio"
                name={id}
                checked={!active}
                onChange={() => pick([])}
                className="sr-only"
              />
              {anyLabel}
              {!active && <Check aria-hidden="true" strokeWidth={2} className="size-4.5 shrink-0" />}
            </label>
          )}
          {options.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <label key={option.value} className={rowClass(checked)} onClick={() => closeIfUnchanged(checked)}>
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  name={id}
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  className="sr-only"
                />
                {option.label}
                {checked && <Check aria-hidden="true" strokeWidth={2} className="size-4.5 shrink-0" />}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
