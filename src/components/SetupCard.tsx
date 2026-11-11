import { useEffect, useId, useRef, type ReactNode } from 'react'
import { ArrowLeftIcon } from './icons.tsx'
import { focusRing } from './styles.ts'

type SetupCardProps = {
  title: string
  step?: string
  /** Shown above the title, both centred (the sign-up card) */
  logo?: ReactNode
  onBack?: () => void
  /** Width cap; each step's design uses its own card width */
  className?: string
  children: ReactNode
}

export function SetupCard({ title, step, logo, onBack, className = 'max-w-152.5', children }: SetupCardProps) {
  const headingId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the new step's heading so keyboard and screen reader users start at the top
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const heading = (
    <h1
      ref={headingRef}
      id={headingId}
      tabIndex={-1}
      className="font-display text-[2.125rem] leading-[2.375rem] font-light tracking-[-0.04em] outline-none sm:text-[2.6875rem] sm:leading-[2.8125rem]"
    >
      {title}
    </h1>
  )

  return (
    <section
      aria-labelledby={headingId}
      className={`w-full rounded-3xl bg-white px-6 py-8 sm:px-12 sm:py-10 ${className}`}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className={`mb-6 flex items-center gap-2 rounded-md text-body sm:mb-8.75 ${focusRing}`}
        >
          <ArrowLeftIcon className="size-6" />
          Back
        </button>
      )}
      {logo ? (
        <header className="flex flex-col items-center gap-6 text-center sm:gap-8">
          {logo}
          {heading}
        </header>
      ) : (
        <header className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {heading}
          {step && <p className="text-body whitespace-nowrap text-muted">{step}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
