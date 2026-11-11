const box = '[transform-box:fill-box]'

// Experience rows on the mock profile page; reused for the captured thumbnail
const rows = [112, 136, 160]

function ExperienceRows({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <>
      {rows.map((rowY) => (
        <g key={rowY} transform={`translate(${x} ${y})`}>
          <rect x="22" y={rowY} width="14" height="14" rx="3" fill="#dbe4f3" />
          <rect x="42" y={rowY + 1} width="80" height="4.5" rx="2.25" fill="#55545a" />
          <rect x="42" y={rowY + 8} width="110" height="3.5" rx="1.75" fill="#c8c8c8" />
        </g>
      ))}
    </>
  )
}

/**
 * Explains the LinkedIn shortcut: select the Experience section, capture it,
 * drop it into the upload tray, and the form fills in. Holds a still frame
 * when the viewer prefers reduced motion.
 */
export function LinkedInShotAnimation({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="A screenshot of a LinkedIn profile's experience section is uploaded and the form fills itself in"
      className={className}
    >
      {/* Profile page in a browser window */}
      <rect x="10" y="14" width="190" height="172" rx="10" fill="#fff" stroke="#e3e3e3" />
      <circle cx="22" cy="26" r="2.5" fill="#d9d9d9" />
      <circle cx="30" cy="26" r="2.5" fill="#d9d9d9" />
      <circle cx="38" cy="26" r="2.5" fill="#d9d9d9" />
      <rect x="18" y="38" width="174" height="26" rx="4" fill="#e9eef7" />
      <circle cx="40" cy="66" r="12" fill="#cfd6e4" stroke="#fff" strokeWidth="3" />
      <rect x="58" y="70" width="70" height="6" rx="3" fill="#3c3c41" />
      <rect x="58" y="80" width="96" height="4" rx="2" fill="#c8c8c8" />
      <rect x="22" y="98" width="48" height="5" rx="2.5" fill="#3c3c41" />
      <ExperienceRows />

      {/* Screenshot selection drawn over the Experience section */}
      <rect
        x="16"
        y="92"
        width="176"
        height="88"
        rx="4"
        fill="#2742e8"
        fillOpacity="0.08"
        stroke="#2742e8"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className={`${box} origin-top-left animate-shot-select motion-reduce:animate-none`}
      />

      {/* Capture flash */}
      <rect
        x="10"
        y="14"
        width="190"
        height="172"
        rx="10"
        fill="#fff"
        className="animate-shot-flash opacity-0 motion-reduce:animate-none"
      />

      {/* Form fields that fill in once the screenshot is read */}
      {[22, 46, 70].map((fieldY, i) => (
        <g key={fieldY}>
          <rect x="220" y={fieldY} width="90" height="16" rx="4" fill="#fff" stroke="#e3e3e3" />
          <rect
            x="226"
            y={fieldY + 6}
            width={[62, 48, 56][i]}
            height="4"
            rx="2"
            fill="#3c3c41"
            style={{ animationDelay: `${i * 0.2}s` }}
            className={`${box} origin-left animate-shot-fill motion-reduce:animate-none`}
          />
        </g>
      ))}

      {/* Upload tray */}
      <rect x="220" y="110" width="90" height="70" rx="10" fill="#f7f5f1" stroke="#c8c8c8" strokeDasharray="4 3" />
      <path
        d="M265 156v-18m-7 7 7-7 7 7m-17 18h20"
        fill="none"
        stroke="#b5b5b5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The captured section shrinking into the tray */}
      <g className={`${box} origin-top-left animate-shot-fly opacity-0 motion-reduce:animate-none`}>
        <rect x="18" y="96" width="172" height="84" rx="6" fill="#fff" stroke="#d6d6d6" />
        <ExperienceRows y={-8} />
      </g>

      {/* Done */}
      <g className={`${box} origin-center animate-shot-check motion-reduce:animate-none`}>
        <circle cx="306" cy="112" r="9" fill="#101013" />
        <path
          d="m302 112 3 3 5-6"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
