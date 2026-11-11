import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { focusRing } from './styles.ts'

export const promptPrimaryButton = `flex items-center justify-center gap-2.5 rounded-xl bg-ink px-6 py-4.5 text-action font-medium whitespace-nowrap text-white transition-colors hover:bg-neutral-800 disabled:cursor-wait ${focusRing}`
export const promptSecondaryButton = `rounded-xl border border-control bg-white px-6 py-4.5 text-action font-medium whitespace-nowrap transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`

/** The small black tag that marks something as part of the prototype, not the product */
export function PrototypeNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-detail text-subtle">
      <span className="rounded-full bg-ink px-2 py-0.5 text-caption font-medium text-white">Prototype</span>
      {children}
    </p>
  )
}

type PromptDialogProps = {
  /** Small monospace label above the title */
  eyebrow: string
  title: string
  description: string
  onClose: () => void
  /** What takes focus when the dialog opens, usually the main action */
  initialFocus?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** A short modal for one decision: a pitch, a permission. Opens as soon as it mounts. */
export function PromptDialog({ eyebrow, title, description, onClose, initialFocus, children }: PromptDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    initialFocus?.current?.focus()
  }, [initialFocus])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onClose={onClose}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-140 overflow-y-auto overscroll-contain rounded-3xl border-0 bg-white p-0 text-ink backdrop:bg-black/40"
    >
      <div className="relative px-6 pt-7 pb-6 sm:px-10 sm:pt-10 sm:pb-9">
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className={`absolute top-4 right-4 grid size-10 place-items-center rounded-lg text-nav transition-colors hover:bg-track sm:top-6 sm:right-6 ${focusRing}`}
        >
          <X aria-hidden="true" strokeWidth={1.75} className="size-5.5" />
        </button>
        <p className="pr-12 font-mono text-caption tracking-[0.14em] text-meta uppercase">{eyebrow}</p>
        <h2
          id={headingId}
          className="mt-3 pr-8 font-display text-[1.875rem] leading-tight font-light tracking-[-0.03em] text-balance sm:text-[2.375rem]"
        >
          {title}
        </h2>
        <p id={descriptionId} className="mt-3 text-body text-subtle">
          {description}
        </p>
        {children}
      </div>
    </dialog>
  )
}

/** A big serif figure with the line that explains it, as the pitch's headline number */
export function StatCallout({ figure, children }: { figure: string; children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center gap-5 rounded-2xl bg-sidebar px-5 py-4.5 sm:px-6">
      <span className="shrink-0 font-display text-[2.75rem] leading-none font-normal sm:text-[3.25rem]">{figure}</span>
      <p className="text-body text-nav">{children}</p>
    </div>
  )
}
