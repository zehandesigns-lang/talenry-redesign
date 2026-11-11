import type { SVGProps } from 'react'

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9.31 6.64A6 6 0 0 1 17.54 14.3" />
      <path d="M15.28 12.04l2.26 2.26 2.26-2.26" />
      <path d="M14.69 17.36A6 6 0 0 1 6.46 9.7" />
      <path d="M8.72 11.96 6.46 9.7 4.2 11.96" />
    </Icon>
  )
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </Icon>
  )
}

/** The house with a doorstep from the filter design (lucide has no match) */
export function WorkplaceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon strokeWidth={1.75} {...props}>
      <path d="M4 10.4a2 2 0 0 1 .78-1.58l6-4.67a2 2 0 0 1 2.44 0l6 4.67A2 2 0 0 1 20 10.4V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M10 16.5h4" />
    </Icon>
  )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}

/** Google's four-colour "G", as its sign-in buttons show it */
export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
