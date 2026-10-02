import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function MineIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <g stroke="var(--mine-body)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" />
      </g>
      <circle cx="12" cy="12" r="6.6" fill="var(--mine-body)" />
      <circle cx="9.6" cy="9.6" r="1.9" fill="var(--mine-shine)" />
    </svg>
  )
}

export function FlagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M8 3.5v14" stroke="var(--flag-pole)" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 3.5 19 7.6 9 11.7Z" fill="var(--flag-red)" />
      <path d="M9 7.6 19 7.6 9 11.7Z" fill="var(--flag-red-dark)" />
      <path d="M4.5 20.5h9" stroke="var(--flag-pole)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M6.5 18h5" stroke="var(--flag-pole)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function WrongFlagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <g stroke="var(--mine-body)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" />
      </g>
      <circle cx="12" cy="12" r="6.6" fill="var(--mine-body)" />
      <path
        d="M4 4l16 16M20 4 4 20"
        stroke="var(--wrong-mark)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle
        cx="12"
        cy="13"
        r="9"
        fill="var(--clock-face)"
        stroke="var(--clock-rim)"
        strokeWidth="2"
      />
      <path d="M10 2.5h4" stroke="var(--clock-rim)" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M12 13V8.5M12 13l3 2"
        stroke="var(--clock-hand)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
