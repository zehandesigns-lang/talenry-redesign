import fullBackground from '../assets/onboarding-bg-full.jpg'
import { FindingMatches } from '../screens/FindingMatches.tsx'

/**
 * Sits over the blurred job board while the post-onboarding search runs.
 * The onboarding painting starts on top and fades away, so step 2 flows straight into the board.
 */
export function MatchingOverlay({ leaving }: { leaving: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center overflow-y-auto px-4 py-20 transition-opacity duration-500 motion-reduce:transition-none ${
        leaving ? 'pointer-events-none opacity-0' : ''
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-backdrop-out bg-[#3d4a22] bg-cover bg-bottom motion-reduce:animate-none motion-reduce:opacity-0"
        style={{ backgroundImage: `url(${fullBackground})` }}
      />
      <div className="relative flex w-full justify-center">
        <FindingMatches />
      </div>
    </div>
  )
}
