import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { NavSection } from './useActiveSection.ts'

/*
 * Shared pieces for the reading pages (the case study and the reel plan): cream paper, serif
 * headings, a sticky section list on the left and one narrow column of content.
 */

export const ink = 'text-[#262a33]'
export const soft = 'text-[#262a33]/55'
export const body = `text-[0.9375rem] leading-[1.6] ${ink}`
export const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24366e]'

/** Paper grain over the page background, like a printed page */
export function PaperGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 opacity-50 mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }}
    />
  )
}

type TopBarProps = { crumb: string; title: string; link: { href: string; label: string } }

/** Breadcrumb on the left, one outbound link on the right */
export function TopBar({ crumb, title, link }: TopBarProps) {
  return (
    <header className="relative flex items-center justify-between gap-4 px-6 pt-6 text-[0.9375rem]">
      <p className="whitespace-nowrap">
        <span className={`max-sm:hidden ${soft}`}>{crumb}</span>
        <span className="px-1.5 text-[#262a33]/30 max-sm:hidden">/</span>
        <span className={ink}>{title}</span>
      </p>
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-1 rounded-sm whitespace-nowrap ${ink} underline-offset-4 hover:underline ${focus}`}
      >
        {link.label}
        <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </a>
    </header>
  )
}

/** The fixed list of sections on wide screens, with the current one marked */
export function SectionNav({ sections, active }: { sections: readonly NavSection[]; active: string }) {
  return (
    <nav aria-label="Sections" className="fixed top-60 left-6 hidden min-[1180px]:block">
      <ul className="flex flex-col gap-1.5">
        {sections.map(({ id, label }) => (
          <li key={id} className="relative">
            {active === id && (
              <span aria-hidden="true" className="absolute top-1/2 -left-3.5 size-1.5 -translate-y-1/2 bg-[#24366e]" />
            )}
            <a
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              className={`block rounded-sm py-0.5 text-[0.9375rem] transition-colors ${focus} ${
                active === id ? 'text-[#24366e]' : 'text-[#262a33]/45 hover:text-[#262a33]'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Label and values in columns, under the page title */
export function MetaList({ items }: { items: { label: string; values: string[] }[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 text-[0.9375rem] leading-[1.5] sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className={soft}>{item.label}</dt>
          {item.values.map((value) => (
            <dd key={value} className={`${ink} first-of-type:mt-1.5`}>
              {value}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  )
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[#24366e]">{children}</span>
}

export function Section({ id, label, title, children }: { id: string; label: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 pt-24 sm:pt-32">
      <p className={`text-[0.9375rem] ${soft}`}>{label}</p>
      <h2
        id={`${id}-title`}
        className={`mt-4 font-display text-[1.625rem] leading-[1.2] font-normal tracking-[-0.01em] text-balance sm:text-[1.75rem] ${ink}`}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function P({ children, className = 'mt-5' }: { children: ReactNode; className?: string }) {
  return <p className={`${body} ${className}`}>{children}</p>
}

type PointsProps = { items: { title: string; text: ReactNode }[]; columns?: 1 | 2 | 3; className?: string }

export function Points({ items, columns = 3, className = 'mt-10' }: PointsProps) {
  const grid = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns]
  return (
    <ul className={`grid gap-x-8 gap-y-7 ${grid} ${className}`}>
      {items.map((item) => (
        <li key={item.title} className="text-[0.9375rem] leading-[1.6]">
          <p className={ink}>{item.title}</p>
          <p className={`mt-1 ${soft}`}>{item.text}</p>
        </li>
      ))}
    </ul>
  )
}
