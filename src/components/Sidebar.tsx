import logoMark from '../assets/logo-mark.png'
import autoApplyIcon from '../assets/nav/auto-apply.svg'
import dailyBriefIcon from '../assets/nav/daily-brief.svg'
import dashboardIcon from '../assets/nav/dashboard.svg'
import interviewIcon from '../assets/nav/interview.svg'
import inviteIcon from '../assets/nav/invite.svg'
import jobsIcon from '../assets/nav/jobs.svg'
import newChatIcon from '../assets/nav/new-chat.svg'
import outreachIcon from '../assets/nav/outreach.svg'
import searchIcon from '../assets/nav/search.svg'
import {
  MONTHLY_AUTO_APPLIES,
  TOTAL_CREDITS,
  autoAppliesLeft,
  nextResetDate,
  useOnboarding,
  type DashboardPage,
} from '../onboarding.ts'
import { focusRing } from './styles.ts'

// Jobs Directory and Outreach exist in this prototype; the rest show the full product's shape
const navItems: { label: string; icon: string; page?: DashboardPage }[] = [
  { label: 'New chat', icon: newChatIcon },
  { label: 'Daily Brief', icon: dailyBriefIcon },
  { label: 'Dashboard', icon: dashboardIcon },
  { label: 'Jobs Directory', icon: jobsIcon, page: 'jobs' },
  { label: 'Auto-apply', icon: autoApplyIcon },
  { label: 'Outreach', icon: outreachIcon, page: 'outreach' },
  { label: 'Interview prep', icon: interviewIcon },
  { label: 'Search', icon: searchIcon },
  { label: 'Invite and earn', icon: inviteIcon },
]

const recentChats = ['Product Designer', 'Getting started']

const resetFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

type UsageMeterProps = {
  label: string
  value: number
  total: number
  note?: string
  className?: string
}

function UsageMeter({ label, value, total, note, className = '' }: UsageMeterProps) {
  return (
    <div className={className}>
      <p className="flex items-baseline justify-between gap-3 text-ui-sm text-[#55545a]">
        {label}{' '}
        <span className="whitespace-nowrap">
          <span className="text-ui font-semibold text-nav-active tabular-nums">{value.toLocaleString()}</span>{' '}
          of {total.toLocaleString()}
        </span>
      </p>
      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-line">
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
      {note && <p className="mt-1.5 text-caption text-soft">{note}</p>}
    </div>
  )
}

export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {/* The logo file is navy on white; these filters turn it black and drop the white */}
      <img src={logoMark} alt="" className="w-[1.4em] mix-blend-multiply contrast-[3] grayscale" />
      <span className="leading-[normal] font-bold text-nav-active">Talenry</span>
    </span>
  )
}

type SidebarProps = {
  className?: string
  /** Called after any item is picked, so a drawer can close */
  onNavigate?: () => void
  /** Emails waiting to go out, shown as a count on Outreach */
  outreachCount?: number
}

export function Sidebar({ className = '', onNavigate, outreachCount = 0 }: SidebarProps) {
  const { account, credits, autoApplies, page, setPage } = useOnboarding()
  const initials = `${account.firstName.trim()[0] ?? ''}${account.lastName.trim()[0] ?? ''}`.toUpperCase()

  return (
    <aside className={`w-75 shrink-0 flex-col overflow-y-auto bg-sidebar ${className}`}>
      <Brand className="px-5 pt-6 pb-4.5 text-[1.6875rem]" />
      <div className="mx-4 border-t border-sidebar-line" />

      <nav aria-label="Main" className="px-4 pt-5">
        <ul className="flex flex-col gap-2.5">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                aria-current={item.page === page ? 'page' : undefined}
                onClick={() => {
                  if (item.page) setPage(item.page)
                  onNavigate?.()
                }}
                className={`flex h-11.5 w-full items-center gap-3.5 rounded-lg border px-3 text-ui font-semibold transition-colors ${focusRing} ${
                  item.page === page
                    ? 'border-chip-line bg-white text-nav-active'
                    : 'border-transparent text-nav hover:bg-white/60'
                }`}
              >
                <img src={item.icon} alt="" className="size-5.5" />
                {item.label}
                {item.page === 'outreach' && outreachCount > 0 && (
                  <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-caption leading-none font-semibold text-white">
                    {outreachCount}
                    <span className="sr-only"> {outreachCount === 1 ? 'email' : 'emails'} to send</span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="recent-heading" className="mt-6.5 px-7">
        <h2
          id="recent-heading"
          className="text-xs leading-[normal] font-bold tracking-[0.1em] text-[#706e73] uppercase"
        >
          Recent
        </h2>
        <ul className="mt-4 flex flex-col gap-4.5">
          {recentChats.map((chat) => (
            <li key={chat} className="flex">
              <button
                type="button"
                onClick={onNavigate}
                className={`block rounded text-left text-ui text-[#55545a] hover:text-nav-active ${focusRing}`}
              >
                {chat}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto flex flex-col gap-3 px-4 pt-8 pb-6">
        <section aria-labelledby="plan-heading" className="rounded-lg border border-chip-line bg-white p-3">
          <h2
            id="plan-heading"
            className="text-xs leading-[normal] font-bold tracking-[0.1em] text-[#706e73] uppercase"
          >
            Starter plan
          </h2>
          <UsageMeter className="mt-2.5" label="Credits left" value={credits} total={TOTAL_CREDITS} />
          <UsageMeter
            className="mt-3"
            label="Auto-applies left"
            value={autoAppliesLeft(autoApplies)}
            total={MONTHLY_AUTO_APPLIES}
            note={`${MONTHLY_AUTO_APPLIES} a month · resets ${resetFormat.format(nextResetDate())}`}
          />
        </section>

        <button
          type="button"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-ui font-semibold text-nav-active ${focusRing}`}
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-black text-[0.625rem] font-bold text-white"
          >
            {initials}
          </span>
          Account
        </button>
      </div>
    </aside>
  )
}
