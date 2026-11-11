import type { ReactNode } from 'react'
import type { CompanyId } from '../data/jobs.ts'

// Simple marks for the mock companies, drawn on a 40×40 grid
const marks: Record<CompanyId, ReactNode> = {
  parallel: <circle cx="20" cy="20" r="11" fill="none" stroke="#2f6f53" strokeWidth="6" />,
  northwind: (
    <>
      <path d="M20 6 34 20 20 34Z" fill="#2742e8" />
      <path d="M20 6 6 20 20 34Z" fill="#131a55" />
    </>
  ),
  lumen: (
    <>
      <circle cx="20" cy="20" r="7" fill="#f97316" />
      <path
        d="M20 5v4M20 31v4M5 20h4M31 20h4M9.4 9.4l2.8 2.8M27.8 27.8l2.8 2.8M9.4 30.6l2.8-2.8M27.8 12.2l2.8-2.8"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  prism: (
    <>
      <path d="M20 7 34 32H6Z" fill="#a21caf" />
      <path d="M20 7 26.5 32h-13Z" fill="#e879f9" />
    </>
  ),
  kestrel: (
    <path
      d="m8 13 12 9 12-9M8 21l12 9 12-9"
      fill="none"
      stroke="#6d28d9"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cobalt: (
    <>
      <path d="m20 6 12.1 7v14L20 34 7.9 27V13Z" fill="#0f766e" />
      <circle cx="20" cy="20" r="4.5" fill="#5eead4" />
    </>
  ),
  fieldnote: (
    <>
      <path d="M10 8h14l6 6v18H10Z" fill="#facc15" />
      <path d="M24 8v6h6Z" fill="#ca8a04" />
    </>
  ),
  tidepool: (
    <path
      d="M7 14c3-3 5-3 8 0s5 3 8 0 5-3 8 0M7 21c3-3 5-3 8 0s5 3 8 0 5-3 8 0M7 28c3-3 5-3 8 0s5 3 8 0 5-3 8 0"
      fill="none"
      stroke="#0284c7"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  ),
  orbital: (
    <>
      <circle cx="20" cy="20" r="7.5" fill="#111827" />
      <ellipse
        cx="20"
        cy="20"
        rx="15"
        ry="5"
        transform="rotate(-20 20 20)"
        fill="none"
        stroke="#111827"
        strokeWidth="2.5"
      />
    </>
  ),
  saffron: (
    <>
      <path d="M8 32V20A12 12 0 0 1 20 8v24Z" fill="#ea580c" />
      <path d="M20 32V8a12 12 0 0 1 12 12v12Z" fill="#fbbf24" />
    </>
  ),
  meridian: (
    <path
      d="M20 6 33 12.5H7ZM9 15.5h3.5v11H9Zm6.2 0h3.5v11h-3.5Zm6.1 0h3.5v11h-3.5Zm6.2 0H31v11h-3.5ZM7 29h26v3.5H7Z"
      fill="#1e3a8a"
    />
  ),
  juniper: (
    <>
      <path d="M9 31C9 17 17 9 32 8c-1 14-9 23-23 23Z" fill="#16a34a" />
      <path d="M10 30 24 16" stroke="#dcfce7" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
}

export function CompanyLogo({ company, className = '' }: { company: CompanyId; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[0.625rem] border border-chip-line bg-white ${className}`}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-[68%]">
        {marks[company]}
      </svg>
    </span>
  )
}
