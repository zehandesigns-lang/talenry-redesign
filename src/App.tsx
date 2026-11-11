import { useEffect, useLayoutEffect } from 'react'
import { MatchingOverlay } from './components/MatchingOverlay.tsx'
import { OnboardingShell } from './components/OnboardingShell.tsx'
import { PrototypeControls } from './components/PrototypeControls.tsx'
import { usePresence } from './lib/usePresence.ts'
import { useOnboarding } from './onboarding.ts'
import { AccountSetup } from './screens/AccountSetup.tsx'
import { BuildProfile } from './screens/BuildProfile.tsx'
import { JobsDashboard } from './screens/JobsDashboard.tsx'
import { SignUp } from './screens/SignUp.tsx'

function App() {
  const { step } = useOnboarding()
  const searching = step === 'matching'
  const inApp = searching || step === 'dashboard'
  // Keep the search overlay for a moment after it ends, so it fades off the board
  const overlay = usePresence(searching, 600)

  // The board draws at a different scale (see index.css). The search runs over the board, so it
  // switches with it; set before paint to avoid a jump.
  useLayoutEffect(() => {
    document.documentElement.dataset.screen = inApp ? 'dashboard' : 'onboarding'
  }, [inApp])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  return (
    <>
      {inApp ? (
        <JobsDashboard searching={searching} />
      ) : (
        // Sign-up and account setup share one painting, so signing in only swaps the card
        <OnboardingShell background={step === 'profile' ? 'full' : 'hills'}>
          {step === 'signup' && <SignUp />}
          {step === 'account' && <AccountSetup />}
          {step === 'profile' && <BuildProfile />}
        </OnboardingShell>
      )}
      {overlay.mounted && <MatchingOverlay leaving={overlay.leaving} />}
      <PrototypeControls />
    </>
  )
}

export default App
