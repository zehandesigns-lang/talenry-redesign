import { useEffect, useState } from 'react'

/** Keeps something rendered for `exitMs` after `show` turns false, so it can animate out. */
export function usePresence(show: boolean, exitMs: number) {
  const [lingering, setLingering] = useState(false)
  const [lastShow, setLastShow] = useState(show)

  // Adjusting during render (not in an effect) avoids a frame where it unmounts and pops back
  if (show !== lastShow) {
    setLastShow(show)
    if (!show) setLingering(true)
  }

  useEffect(() => {
    if (!lingering) return
    const timer = window.setTimeout(() => setLingering(false), exitMs)
    return () => window.clearTimeout(timer)
  }, [lingering, exitMs])

  return { mounted: show || lingering, leaving: !show && lingering }
}
