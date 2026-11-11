import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import hillsPainting from '../assets/onboarding-bg-hills.jpg'
import logo from '../assets/logo.png'
import {
  Accent,
  MetaList,
  P,
  PaperGrain,
  Points,
  Section,
  SectionNav,
  TopBar,
  focus,
  ink,
  soft,
} from './editorial.tsx'
import { useActiveSection } from './useActiveSection.ts'

/*
 * Case study for the onboarding redesign. The layout follows a reading-first portfolio pattern:
 * a sticky section list on the left, a wide hero, then one narrow column of story and visuals.
 */

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'solution', label: 'Solution' },
  { id: 'journey', label: 'The journey' },
  { id: 'process', label: 'How it was made' },
  { id: 'decisions', label: 'Design decisions' },
  { id: 'measuring', label: 'Measuring success' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'closing', label: 'Closing thoughts' },
] as const

// Pages serves the site from a subpath, so the prototype link and the media hang off the base URL
const PROTOTYPE_URL = import.meta.env.BASE_URL
const media = (file: string) => `${import.meta.env.BASE_URL}case-study/${file}`

/** Plays muted and looping while it's on screen; with reduced motion it waits on its still frame */
function WalkthroughVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={media('walkthrough.mp4')}
      poster={media('walkthrough-poster.webp')}
      width={1440}
      height={900}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label="A walkthrough of the prototype: one-click sign-up, the profile answers, the personalised search, ranked matches, uploading a résumé and answering application questions at the first auto-apply, the agent applying, the outreach emails being sent from Gmail, and the Pro offer."
      className="h-auto w-full rounded-md border border-black/6 bg-white"
    />
  )
}

type Shot = { src: string; width: number; height: number; alt: string }

/** A screenshot that opens full size in a new tab */
function Screenshot({ shot, className = '' }: { shot: Shot; className?: string }) {
  return (
    <a href={shot.src} target="_blank" rel="noreferrer" className={`block rounded-md ${focus} ${className}`}>
      <img
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-md border border-black/6 bg-white"
      />
      <span className="sr-only"> (opens full size)</span>
    </a>
  )
}

function Figure({ shot, caption, className = 'mt-10' }: { shot: Shot; caption: string; className?: string }) {
  return (
    <figure className={className}>
      <Screenshot shot={shot} />
      <figcaption className={`mt-3 text-[0.875rem] leading-[1.5] ${soft}`}>{caption}</figcaption>
    </figure>
  )
}

const shots = {
  before1: { src: media('before-step-1.webp'), width: 1300, height: 2000, alt: 'Original Step 1 of 4, “What are you looking for?”: target role, seniority, country, state, city, relocation, non-compete, notice period, security clearance, government work, office days, travel, gender and race.' },
  before2: { src: media('before-step-2.webp'), width: 1300, height: 2000, alt: 'Original Step 2 of 4, “Now your profile: two ways in”, with Upload a résumé and Build it on your own.' },
  before3: { src: media('before-step-3.webp'), width: 1300, height: 2000, alt: 'Original Step 3 of 4, “Your profile, in your own words”: name, email, phone, address, postal code, LinkedIn and self-identification questions. Personal answers are blurred.' },
  before4: { src: media('before-step-4.webp'), width: 1300, height: 2000, alt: 'Original Step 4 of 4, “Last thing, tell me how to work”: settings for applying, recruiter outreach and interview prep.' },
  oldBrief: { src: media('old-daily-brief.webp'), width: 1600, height: 2008, alt: 'The original Daily Brief: 17 new roles, a “Your search so far” summary with counts and credits, and a “Still to do” list.' },
  oldDashboard: { src: media('old-dashboard.webp'), width: 1600, height: 2008, alt: 'The original dashboard: 17 active roles, a saved jobs table with next actions, and auto-apply and outreach stats.' },
  beforeDashboard: { src: media('before-dashboard.webp'), width: 1590, height: 1590, alt: 'The original dashboard after setup: “Your pipeline is empty”, with every count at zero.' },
  signup: { src: media('signup-card.webp'), width: 1868, height: 1400, alt: 'Create an Account card on a painted landscape, with Continue with Google at the top.' },
  profile: { src: media('profile-card.webp'), width: 1920, height: 1440, alt: 'Build your profile, step 2 of 2: role, minimum salary, seniority, location, workplace, relocation and visa.' },
  matching: { src: media('matching-card.webp'), width: 2000, height: 1500, alt: 'Finding your matches card over a blurred job board, with a status line and progress bar.' },
  complete: { src: media('complete-card.webp'), width: 1920, height: 1440, alt: 'Let’s complete your profile modal with two choices: Upload your résumé, marked quickest, or Fill it in manually.' },
  applying: { src: media('applying-panel.webp'), width: 1760, height: 1320, alt: 'A live status panel listing jobs being applied to: sent, filling form and queued.' },
  prompt: { src: media('prompt-dialog.webp'), width: 1760, height: 1320, alt: 'Let’s finish with outreach pop-up, offering to review the emails written for each hiring manager.' },
  outreach: { src: media('outreach-list.webp'), width: 1560, height: 1170, alt: 'Outreach page with To send and Sent tabs, a Connect Gmail bar and drafted emails showing each recipient address and attached résumé and cover letter.' },
  pro: { src: media('pro-dialog.webp'), width: 1920, height: 1440, alt: 'Get hired sooner with Pro pop-up: 10 times the auto-applies, follow-ups sent automatically, tailored résumés and mock interviews.' },
  gmail: { src: media('gmail-dialog.webp'), width: 1760, height: 1320, alt: 'Connect Gmail to send dialog, listing send-only access and a promise never to read the rest of the inbox.' },
  caughtUp: { src: media('caughtup-card.webp'), width: 1560, height: 1170, alt: 'An empty To send tab saying you’re all caught up, with a suggested next step to line up more applications.' },
} satisfies Record<string, Shot>

const journey: { title: string; text: string; shot: Shot }[] = [
  {
    title: 'Sign up in one click',
    text: 'Continue with Google brings the name and photo along, so setup starts half done.',
    shot: shots.signup,
  },
  {
    title: 'Only what changes the matches',
    text: 'Role, seniority, location, work setup and visa, mostly taps. Each question says why it’s asked, and “Step 1 of 2” now means two short screens.',
    shot: shots.profile,
  },
  {
    title: 'Matches in seconds',
    text: 'A personalised search runs over the blurred job board, then the listings rise into place.',
    shot: shots.matching,
  },
  {
    title: 'Questions when they unlock something',
    text: 'The first auto-apply asks for what application forms need: a résumé, or the same details typed in, then a few quick answers.',
    shot: shots.complete,
  },
  {
    title: 'Watch the agent work',
    text: 'Applications run as a live queue. When the agent isn’t sure of an answer, it pauses and asks instead of guessing.',
    shot: shots.applying,
  },
  {
    title: 'A nudge to reach out',
    text: 'Once the applications are in, Talenry points to the step that improves the odds next: a note to each hiring manager.',
    shot: shots.prompt,
  },
  {
    title: 'Emails, already written',
    text: 'One email per hiring manager, with the résumé and a tailored cover letter attached. Connect Gmail once, then send them all or one at a time.',
    shot: shots.outreach,
  },
  {
    title: 'The upgrade, after the value',
    text: 'Only after the applications and emails are out does Pro appear, framed by what it adds: 10× the auto-applies and follow-ups sent for you.',
    shot: shots.pro,
  },
]

/** Timed from a screen recording of one run through the original onboarding */
const walkthrough: { label: string; seconds: number; kind: 'form' | 'wait' | 'other' }[] = [
  { label: 'Sign up', seconds: 5, kind: 'other' },
  { label: 'Step 1 · Intent', seconds: 157, kind: 'form' },
  { label: 'Step 2 · Profile', seconds: 8, kind: 'form' },
  { label: 'Step 3 · Details', seconds: 280, kind: 'form' },
  { label: 'Step 4 · Agent', seconds: 49, kind: 'form' },
  { label: 'Empty dashboard', seconds: 26, kind: 'wait' },
  { label: 'Searching for jobs', seconds: 40, kind: 'wait' },
]

const duration = (seconds: number) =>
  seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min${seconds % 60 ? ` ${seconds % 60} s` : ''}`

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Sign-up to first job in the original flow, drawn to scale */
function Walkthrough() {
  const total = walkthrough.reduce((sum, part) => sum + part.seconds, 0)
  const sum = (kind: string) => walkthrough.filter((part) => part.kind === kind).reduce((n, part) => n + part.seconds, 0)
  const tone = { form: 'bg-[#b42318]', wait: 'bg-[#262a33]/25', other: 'bg-[#262a33]/45' }

  return (
    <figure className="mt-10 rounded-2xl border border-[#262a33]/10 bg-white/55 p-6 sm:p-8">
      <p className={`font-mono text-[0.75rem] tracking-[0.12em] uppercase ${soft}`}>Before · one recorded run</p>
      <p className={`mt-3 font-display text-[2.25rem] leading-none font-normal tracking-[-0.02em] ${ink}`}>
        {duration(total)}
      </p>
      <p className={`mt-2 text-[0.9375rem] ${soft}`}>from sign-up to the first job on screen</p>

      <div aria-hidden="true" className="mt-7 flex h-3 gap-0.5 overflow-hidden rounded-full">
        {walkthrough.map((part) => (
          <span key={part.label} title={`${part.label}: ${duration(part.seconds)}`} className={tone[part.kind]} style={{ flexGrow: part.seconds }} />
        ))}
      </div>
      <div aria-hidden="true" className={`mt-2 flex justify-between font-mono text-[0.75rem] ${soft}`}>
        <span>0:00</span>
        <span>{clock(total)} · first job</span>
      </div>
      <ol className="sr-only">
        {walkthrough.map((part) => (
          <li key={part.label}>
            {part.label}: {duration(part.seconds)}
          </li>
        ))}
      </ol>

      <ul className="mt-6 grid gap-3 text-[0.875rem] leading-[1.5] sm:grid-cols-2 sm:gap-8">
        <li className="flex gap-2.5">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[#b42318]" />
          <span className={soft}>
            <span className={ink}>{duration(sum('form'))}</span> filling in four setup steps
          </span>
        </li>
        <li className="flex gap-2.5">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[#262a33]/25" />
          <span className={soft}>
            <span className={ink}>{duration(sum('wait'))}</span> on an empty dashboard, then a loading list
          </span>
        </li>
      </ul>
      <figcaption className={`mt-6 text-[0.8125rem] ${soft}`}>
        Timed from a screen recording of one run through the original onboarding.
      </figcaption>
    </figure>
  )
}

const oldSteps = [
  { title: 'Step 1 · What are you looking for?', time: 157, shot: shots.before1 },
  { title: 'Step 2 · Two ways in', time: 8, shot: shots.before2 },
  { title: 'Step 3 · Your profile, in your own words', time: 280, shot: shots.before3 },
  { title: 'Step 4 · Tell me how to work', time: 49, shot: shots.before4 },
]

const funnel = ['Sign up', 'See matches', 'Auto-apply', 'Outreach', 'Upgrade']

/** The trial funnel, with where the old flow put its heaviest step and where conversion happens */
function Funnel() {
  return (
    <figure className="mt-10">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-0">
        {funnel.map((step, i) => (
          <li key={step} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2.5">
            <div className="flex items-center gap-2 sm:w-full">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-[0.75rem] ${
                  i === 0 ? 'bg-[#b42318] text-white' : i === funnel.length - 1 ? 'bg-[#24366e] text-white' : 'bg-[#262a33]/8 text-[#262a33]'
                }`}
              >
                {i + 1}
              </span>
              {i < funnel.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-[#262a33]/15 sm:block" />}
            </div>
            <p className={`text-[0.9375rem] ${ink}`}>{step}</p>
          </li>
        ))}
      </ol>
      <figcaption className="mt-6 grid gap-2 text-[0.875rem] leading-[1.5] sm:grid-cols-2 sm:gap-8">
        <p className="flex gap-2.5">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[#b42318]" />
          <span className={soft}>The old flow put 15+ fields at step 1, before any value.</span>
        </p>
        <p className="flex gap-2.5">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[#24366e]" />
          <span className={soft}>Trial-to-paid happens at step 5. Only people who get there can convert.</span>
        </p>
      </figcaption>
    </figure>
  )
}

function Stats() {
  const stats = [
    { figure: '1 click', text: 'to sign up with Google. The name and photo come with it.' },
    { figure: '5 answers', text: 'before the first match, down from more than 15 fields.' },
    { figure: '~5 s', text: 'from the last answer to a ranked list of matches.' },
  ]
  return (
    <dl className="mt-10 grid gap-8 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.figure}>
          <dt className={`font-display text-[2.25rem] leading-none font-normal tracking-[-0.02em] ${ink}`}>{stat.figure}</dt>
          <dd className={`mt-3 text-[0.9375rem] leading-[1.6] ${soft}`}>{stat.text}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CaseStudy() {
  const active = useActiveSection(sections)

  return (
    <div className="relative min-h-dvh bg-[#f6f5f1]">
      <PaperGrain />
      <TopBar crumb="Case study" title="Talenry onboarding" link={{ href: PROTOTYPE_URL, label: 'Try the prototype' }} />
      <SectionNav sections={sections} active={active} />

      <main className="relative px-6 pb-24">
        <div className="relative mx-auto mt-16 aspect-[4/5] max-w-[57.75rem] overflow-hidden rounded-md sm:mt-36 sm:aspect-video">
          <img src={hillsPainting} alt="" className="absolute inset-0 size-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative flex size-full flex-col items-center justify-center px-6 text-center text-white">
            <p className="flex items-center gap-3 text-[2.25rem] leading-none font-semibold tracking-[-0.02em] [text-shadow:0_1px_24px_rgb(0_0_0/0.25)] sm:text-[3rem]">
              <img src={logo} alt="" className="size-10 sm:size-13" />
              Talenry
            </p>
            <p className="mt-2 text-[0.9375rem] text-white/85 [text-shadow:0_1px_12px_rgb(0_0_0/0.3)]">Onboarding redesign</p>
            {/* For people who'd rather click through it than read about it */}
            <p className="mt-9 max-w-80 text-[1rem] leading-[1.5] text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)] sm:mt-10 sm:max-w-none">
              See how it works instead of reading the case study.
            </p>
            <a
              href={PROTOTYPE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.9375rem] font-semibold text-[#262a33] shadow-[0_8px_24px_rgb(0_0_0/0.25)] transition-colors hover:bg-[#f6f5f1] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              Open the prototype
              <ArrowUpRight aria-hidden="true" strokeWidth={2} className="size-4" />
            </a>
          </div>
        </div>

        <article className="mx-auto max-w-[43rem]">
          <h1
            className={`mt-10 font-display text-[2rem] leading-[1.15] font-normal tracking-[-0.015em] text-balance sm:text-[2.25rem] ${ink}`}
          >
            Redesigned onboarding that could turn more free users into paying customers
          </h1>
          <p className={`mt-4 text-[1.0625rem] leading-[1.55] ${ink}`}>
            By cutting the time to a first job by over 90%, from 9 min 25 s to 27 s.
          </p>
          <p className={`mt-2 text-[0.875rem] leading-[1.6] ${soft}`}>
            Timed from sign-up to the first job on screen, in recordings of the original flow and the redesign. The
            conversion lift is the hypothesis to test, not a measured result.
          </p>

          <MetaList
            items={[
              { label: 'Role', values: ['Product designer', 'Self-initiated'] },
              { label: 'Goal', values: ['Trial-to-paid conversion'] },
              { label: 'Scope', values: ['Onboarding', 'Activation', 'Upgrade'] },
              { label: 'Process', values: ['Designed in Figma', 'Built with Claude'] },
            ]}
          />
          <p className={`mt-8 text-[0.875rem] ${soft}`}>
            A self-initiated concept. Not commissioned by or affiliated with Talenry.
          </p>

          <Section
            id="overview"
            label="Overview"
            title={
              <>
                Users can’t pay for value <Accent>they never reach.</Accent>
              </>
            }
          >
            <P>
              Talenry is an AI job-search agent. It finds matching jobs, applies for you, writes to hiring managers and
              preps you for interviews. Browsing is free; the agent’s work is what people pay for. The metric I designed
              for was <strong className="font-semibold">trial-to-paid conversion</strong>.
            </P>
            <P className="mt-4">
              That made drop-off the first thing to fix. In a recording of the original flow, the first job appeared more
              than nine minutes after sign-up. Anyone who leaves before then never sees the agent apply or reach out for
              them, so they never learn what they’d be paying for. Once people stay, the next job is to walk them through
              the product one step at a time, so the value is clear before the upgrade appears.
            </P>
            <Points
              items={[
                { title: 'Stop the drop-off', text: 'Ask only what changes the matches, then show jobs straight away.' },
                { title: 'Guide the journey', text: 'Lead people step by step: matches, auto-apply, then outreach.' },
                { title: 'Upgrade after value', text: 'Offer Pro only after the agent has done real work for them.' },
              ]}
            />
          </Section>

          <Section
            id="problem"
            label="Problem"
            title={
              <>
                The old onboarding asked for everything <Accent>before showing anything.</Accent>
              </>
            }
          >
            <P>
              Step 1 of 4 had more than 15 fields, most of them answers that only application forms need: notice period,
              non-compete, security clearance, government work, office days, travel, gender and race. Steps 2 to 4 then
              asked for a full profile and the agent’s settings.
            </P>
            <Walkthrough />
            <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8">
              {oldSteps.map((step) => (
                <li key={step.title}>
                  <Screenshot shot={step.shot} />
                  <p className={`mt-3 text-[0.875rem] leading-[1.5] ${ink}`}>{step.title}</p>
                  <p className={`text-[0.875rem] leading-[1.5] ${soft}`}>{duration(step.time)}</p>
                </li>
              ))}
            </ul>
            <p className={`mt-6 text-[0.875rem] leading-[1.5] ${soft}`}>
              The original four steps, from the same recording. Personal answers are blurred.
            </p>
            <div className="mt-12 grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_14.5rem]">
              <Figure
                className=""
                shot={shots.beforeDashboard}
                caption="After eight minutes of setup, the first screen was a dashboard of zeros."
              />
              <Points
                columns={1}
                className=""
                items={[
                  { title: 'Effort before value', text: 'People worked through four steps of forms before they saw a single job.' },
                  { title: 'Sensitive questions before trust', text: 'Gender and race came before Talenry had shown it could help.' },
                  { title: 'Progress that misleads', text: '“Step 1 of 4” hid how long the first step really was.' },
                ]}
              />
            </div>
            <h3 className={`mt-16 font-display text-[1.125rem] leading-[1.5] font-normal ${ink}`}>
              Why drop-off decides trial-to-paid
            </h3>
            <P className="mt-2">
              Conversion is a funnel. People sign up, see their matches, let the agent apply, see it reach out, and only
              then does paying make sense. Everyone lost at the first step is lost for every step after it. With a 7-day
              trial, time spent on forms is time not spent seeing the agent work.
            </P>
            <Funnel />
          </Section>

          <Section
            id="strategy"
            label="Strategy"
            title={
              <>
                Value first, <Accent>ask the rest later.</Accent>
              </>
            }
          >
            <P>
              One rule shaped every screen: ask for something only when it changes what the user sees next. Everything
              else waits until the moment it’s needed, and comes with a one-line reason.
            </P>
            <Stats />
          </Section>

          <Section
            id="solution"
            label="Solution"
            title={
              <>
                A guided path from sign-up to <Accent>the agent’s first results.</Accent>
              </>
            }
          >
            <P>
              Each step gives people something before it asks for the next thing. By the time Pro appears, they’ve
              watched the agent apply for them and write to the people hiring.
            </P>
            <figure className="mt-10">
              <WalkthroughVideo />
              <figcaption className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <span className={`text-[0.875rem] leading-[1.5] ${soft}`}>
                  The whole journey in under a minute: sign-up, five answers, matches, then the résumé and a few
                  application questions at the first auto-apply, outreach and the Pro offer. Form filling and the
                  agent’s run are sped up.
                </span>
                <a
                  href={PROTOTYPE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#262a33]/20 bg-white/70 px-4 py-2 text-[0.875rem] whitespace-nowrap transition-colors hover:border-[#262a33]/50 ${ink} ${focus}`}
                >
                  Open the prototype
                  <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                </a>
              </figcaption>
            </figure>
          </Section>

          <Section id="journey" label="The journey" title="Eight steps, each one earning the next">
            <P>
              Here’s the path a trial user takes. Every step either shows value or asks for something that unlocks more
              of it.
            </P>
            <ol className="mt-12 flex flex-col gap-14">
              {journey.map((step, i) => (
                <li key={step.title} className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_14.5rem] sm:gap-8">
                  <Screenshot shot={step.shot} />
                  <div className="text-[0.9375rem] leading-[1.6]">
                    <p className={`font-mono text-[0.75rem] tracking-[0.12em] uppercase ${soft}`}>
                      Step {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className={`mt-2 ${ink}`}>{step.title}</h3>
                    <p className={`mt-1 ${soft}`}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            id="process"
            label="How it was made"
            title={
              <>
                Designed in Figma, <Accent>brought to life with Claude.</Accent>
              </>
            }
          >
            <P>
              I designed every screen in Figma first. Then I worked with Claude to turn those designs into a working
              prototype, one screen at a time, so the whole journey could be clicked through instead of imagined.
            </P>
            <Points
              items={[
                {
                  title: 'Designed in Figma',
                  text: 'Layouts, type and components for every step, in Talenry’s own visual language.',
                },
                {
                  title: 'Built with Claude',
                  text: 'A React prototype made from those designs, with loading, empty and error states that behave like the real thing.',
                },
                {
                  title: 'Tested end to end',
                  text: 'From sign-up to the Pro offer, on desktop and phone, by keyboard, with analytics events in place.',
                },
              ]}
            />
            <P className="mt-10">
              Seeing it run changed the design. Building the full flow surfaced moments that static frames hide, like
              what the agent does when it isn’t sure, or what an empty tab should say.
            </P>
          </Section>

          <Section id="decisions" label="Design decisions" title="Small choices that keep people moving">
            <Points
              columns={2}
              items={[
                {
                  title: 'Costs before commitment',
                  text: 'Credits and the monthly auto-apply limit show before every apply, so the upgrade never feels like a catch.',
                },
                {
                  title: 'Sensitive questions wait',
                  text: 'Self-identification moved to its own optional screen, shown only for US jobs, where employers ask.',
                },
                {
                  title: 'Permission, explained',
                  text: 'Gmail access is asked for at the first send, for sending only, in plain words.',
                },
                {
                  title: 'No dead ends',
                  text: 'Every finished state suggests what to do next, like lining up more applications once every email is out.',
                },
              ]}
            />
            <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-6">
              <Figure
                className=""
                shot={shots.gmail}
                caption="Gmail is connected at the first send, and only to send."
              />
              <Figure
                className=""
                shot={shots.caughtUp}
                caption="With everything sent, To send points to the next step."
              />
            </div>
          </Section>

          <Section id="measuring" label="Measuring success" title="How I’d know it’s working">
            <P>
              Trial-to-paid moves slowly, so I’d watch the steps that lead to it. The prototype already logs each one as
              an event.
            </P>
            <Points
              columns={2}
              items={[
                {
                  title: 'Onboarding completion',
                  text: (
                    <>
                      Share of sign-ups who reach their matches, and how long it takes.
                      <code className="mt-1.5 block font-mono text-[0.75rem]">step1_completed · matches_viewed</code>
                    </>
                  ),
                },
                {
                  title: 'Agent activation',
                  text: (
                    <>
                      Share who start auto-apply and finish the apply questions.
                      <code className="mt-1.5 block font-mono text-[0.75rem]">applications_started · agent_ready_completed</code>
                    </>
                  ),
                },
                {
                  title: 'Outreach adoption',
                  text: (
                    <>
                      Share who send the drafted emails, together or one by one.
                      <code className="mt-1.5 block font-mono text-[0.75rem]">outreach_sent</code>
                    </>
                  ),
                },
                {
                  title: 'Upgrade intent',
                  text: (
                    <>
                      Clicks on the Pro offer, then trial-to-paid itself.
                      <code className="mt-1.5 block font-mono text-[0.75rem]">pro_upgrade_clicked</code>
                    </>
                  ),
                },
              ]}
            />
            <p className={`mt-10 text-[0.875rem] leading-[1.6] ${soft}`}>
              These are the measures I’d validate the redesign with. The prototype hasn’t been tested with Talenry’s
              users yet.
            </p>
          </Section>

          <Section id="reflection" label="Reflection" title="What I learned">
            <Points
              columns={2}
              items={[
                {
                  title: 'Conversion starts at sign-up.',
                  text: 'People pay once the product has done something for them. The design work is getting them to that moment quickly.',
                },
                {
                  title: 'Timing changes how a question feels.',
                  text: 'The same questions felt lighter when asked at the moment they unlocked something, with a reason attached.',
                },
              ]}
            />
          </Section>

          <Section
            id="closing"
            label="Closing thoughts"
            title={
              <>
                Not everything at once. <Accent>Onboarding first.</Accent>
              </>
            }
          >
            <P>
              Onboarding wasn’t the only problem I ran into. When I used Talenry, the dashboard and the Daily Brief
              confused me too. Both summarise how the search is going and what to do next, each in its own way, so it
              wasn’t clear which one to rely on or where to start each day.
            </P>
            <div className="mt-10 grid grid-cols-2 gap-x-5">
              <Figure className="" shot={shots.oldBrief} caption="The Daily Brief: new roles, progress and a to-do list." />
              <Figure className="" shot={shots.oldDashboard} caption="The dashboard: the same search, laid out another way." />
            </div>
            <P className="mt-10">
              But no team can fix everything at once. I prioritised the way a business would: start where the metric
              is lost first.
            </P>
            <Points
              items={[
                {
                  title: 'Closest to the metric',
                  text: 'Trial-to-paid can’t move while people leave before they see a single job.',
                },
                {
                  title: 'Every user passes through it',
                  text: 'Every trial starts with onboarding. Only some people ever reach the dashboard.',
                },
                {
                  title: 'It unlocks the rest',
                  text: 'A clearer dashboard only pays off once people get that far.',
                },
              ]}
            />
            <P className="mt-10">
              Next, I’d look at the dashboard and the Daily Brief together, so returning users have one clear place to
              start each day.
            </P>
          </Section>
        </article>
      </main>

      <footer className="relative mx-6 flex flex-col gap-4 border-t border-[#262a33]/10 py-8 text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
        <p className={soft}>Talenry onboarding · Designed in Figma, built with Claude</p>
        <div className="flex items-center gap-6">
          <a
            href={PROTOTYPE_URL}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1 rounded-sm ${ink} underline-offset-4 hover:underline ${focus}`}
          >
            Try the prototype
            <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </a>
          <a
            href="#overview"
            onClick={(event) => {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }}
            className={`flex items-center gap-1 rounded-sm ${soft} hover:text-[#262a33] ${focus}`}
          >
            Back to top
            <ArrowUp aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </a>
        </div>
      </footer>
    </div>
  )
}
