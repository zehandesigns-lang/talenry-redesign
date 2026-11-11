import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useOnboarding } from '../onboarding.ts'
import { focusRing } from './styles.ts'

/**
 * Floating panel for presenting the case study; not part of the product UI.
 * Sits bottom-left so the application status panel owns the bottom-right corner.
 */
export function PrototypeControls() {
  const { step, profile, applyPanel, updateProfile, startNewMonth, reset } = useOnboarding()
  const [open, setOpen] = useState(false)
  const inUS = profile.location?.country === 'United States'

  const rowClass = `w-full rounded-lg px-3 py-2.5 text-left text-ui-sm hover:bg-track ${focusRing}`
  // Clear the dashboard sidebar on wide screens; on phones, give way to the status panel
  const besideSidebar = step === 'dashboard' || step === 'matching'
  const placement = `${besideSidebar ? 'sm:left-79' : ''} ${applyPanel.visible ? 'max-sm:hidden' : ''}`

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 ${placement}`}
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      {open && (
        <div id="prototype-menu" className="w-64 rounded-xl border border-chip-line bg-white p-1.5 shadow-lg">
          <p className="px-3 pt-2 pb-1 text-caption text-subtle">Prototype controls</p>
          <button
            type="button"
            className={rowClass}
            onClick={() =>
              updateProfile({
                location: inUS
                  ? { name: 'Bengaluru', country: 'India' }
                  : { name: 'San Francisco', country: 'United States' },
              })
            }
          >
            Switch location to {inUS ? 'India' : 'the United States'}
          </button>
          <button type="button" className={rowClass} onClick={startNewMonth}>
            Simulate next month (resets auto-applies)
          </button>
          <button
            type="button"
            className={rowClass}
            onClick={() => {
              reset()
              setOpen(false)
            }}
          >
            Restart onboarding
          </button>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="prototype-menu"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-ui-sm font-medium text-white shadow-lg ${focusRing}`}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={2} />
        Prototype
      </button>
    </div>
  )
}
