import { useId, useLayoutEffect, useRef } from 'react'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  detail?: string
}

type SegmentedProps<T extends string> = {
  label: string
  options: SegmentedOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  /** Checkboxes instead of radios */
  multiple?: boolean
  /** One line on why the question is asked */
  hint?: string
  /** Tighter options, for long rows of short labels like 0–5 */
  compact?: boolean
  className?: string
  /** Layout of the grey track (it hugs its options by default) */
  trackClassName?: string
  /** Layout of each option */
  optionClassName?: string
}

type Edges = { top: number; right: number; bottom: number; left: number }

/*
 * The white pill slides to the new choice. The edges facing the way it's going arrive a touch
 * sooner than the trailing ones, so it stretches only slightly (about 14% wider on the longest
 * jump) and settles within 200ms.
 */
const LEAD = '170ms cubic-bezier(0.25, 0.7, 0.3, 1)'
const TRAIL = '200ms cubic-bezier(0.25, 0.7, 0.3, 1.06)'

export function Segmented<T extends string>({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  hint,
  compact = false,
  className = '',
  trackClassName = 'inline-flex',
  optionClassName = 'gap-3',
}: SegmentedProps<T>) {
  const id = useId()
  const trackRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const lastEdges = useRef<Edges | null>(null)
  const selectedIndex = multiple ? -1 : options.findIndex((option) => selected.includes(option.value))

  // Positions the pill under the chosen option, before paint, and keeps it there if the track resizes
  useLayoutEffect(() => {
    if (multiple) return

    function place(animate: boolean) {
      const track = trackRef.current
      const pill = pillRef.current
      if (!track || !pill) return
      const option =
        selectedIndex >= 0 ? track.querySelectorAll<HTMLElement>(':scope > label')[selectedIndex] : undefined
      if (!option || !option.offsetWidth) {
        pill.style.opacity = '0'
        lastEdges.current = null
        return
      }

      const next: Edges = {
        top: option.offsetTop,
        left: option.offsetLeft,
        right: track.clientWidth - option.offsetLeft - option.offsetWidth,
        bottom: track.clientHeight - option.offsetTop - option.offsetHeight,
      }
      const previous = lastEdges.current
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!animate || !previous || reduceMotion) {
        // First appearance fades in where it belongs; resizes and reduced motion just move it
        pill.style.transition = previous || reduceMotion ? 'none' : 'opacity 150ms ease-out'
      } else {
        const toRight = next.left > previous.left
        const down = next.top > previous.top
        pill.style.transition = [
          `${toRight ? 'right' : 'left'} ${LEAD}`,
          `${toRight ? 'left' : 'right'} ${TRAIL}`,
          `${down ? 'bottom' : 'top'} ${LEAD}`,
          `${down ? 'top' : 'bottom'} ${TRAIL}`,
        ].join(', ')
      }
      for (const edge of ['top', 'right', 'bottom', 'left'] as const) pill.style[edge] = `${next[edge]}px`
      pill.style.opacity = '1'
      lastEdges.current = next
    }

    place(true)

    // Only real size changes re-place it (the observer's first report would cut the slide short)
    const track = trackRef.current
    if (!track) return
    let size = `${track.clientWidth}x${track.clientHeight}`
    const observer = new ResizeObserver(() => {
      const now = `${track.clientWidth}x${track.clientHeight}`
      if (now === size) return
      size = now
      place(false)
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [multiple, selectedIndex])

  function toggle(value: T) {
    if (!multiple) onChange([value])
    else onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  // Multiple choice can't share one sliding pill, so each checked option gets its own
  const checkedStyle = multiple ? 'has-checked:border-chip has-checked:bg-white has-checked:shadow-xs' : ''

  return (
    <div className={className}>
      <p id={id} className="text-body">
        {label}
      </p>
      <div
        ref={trackRef}
        role={multiple ? 'group' : 'radiogroup'}
        aria-labelledby={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`relative mt-2.5 gap-1 rounded-xl bg-track px-2 py-2 sm:px-3.25 ${trackClassName}`}
      >
        {!multiple && (
          <span
            ref={pillRef}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-lg border border-chip bg-white opacity-0 shadow-xs"
          />
        )}
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative flex min-h-13.5 cursor-pointer items-center justify-center rounded-lg border border-transparent whitespace-nowrap text-subtle transition-colors hover:text-ink has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ink ${checkedStyle} ${compact ? 'min-w-10 px-2' : 'px-2 sm:px-3.75'} ${optionClassName}`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={id}
              value={option.value}
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="sr-only"
            />
            <span className="text-body">{option.label}</span>{' '}
            {option.detail && <span className="text-detail text-faint">{option.detail}</span>}
          </label>
        ))}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-ui-sm text-subtle">
          {hint}
        </p>
      )}
    </div>
  )
}
