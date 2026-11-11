import type { ReactNode } from 'react'
import fullBackground from '../assets/onboarding-bg-full.jpg'
import hillsBackground from '../assets/onboarding-bg-hills.jpg'
import logo from '../assets/logo.png'

// Sign-up and account setup show a close crop of the painting; the profile step shows all of it
const backgrounds = { hills: hillsBackground, full: fullBackground }

type OnboardingShellProps = {
  background: keyof typeof backgrounds
  children: ReactNode
}

export function OnboardingShell({ background, children }: OnboardingShellProps) {
  return (
    <div className="relative isolate min-h-dvh bg-[#3d4a22]">
      {Object.entries(backgrounds).map(([key, src]) => (
        <div
          key={key}
          aria-hidden="true"
          className={`fixed inset-0 -z-10 bg-cover bg-bottom transition-opacity duration-700 motion-reduce:transition-none ${key === background ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <img
        src={logo}
        alt="Talenry"
        className="absolute top-4 left-4 size-12 sm:top-8 sm:left-8 sm:size-15"
      />
      <main className="flex min-h-dvh items-center justify-center px-4 py-20 sm:py-24">
        {children}
      </main>
    </div>
  )
}
