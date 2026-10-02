import type { SVGProps } from 'react'

export type Mood = 'smile' | 'oh' | 'dead' | 'cool'

const LINE = { stroke: 'var(--smiley-line)', strokeWidth: 1.4, strokeLinecap: 'round' } as const

export function Smiley({ mood, ...props }: SVGProps<SVGSVGElement> & { mood: Mood }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="var(--smiley)" {...LINE} />
      <path
        d="M5.5 16.5a8.5 8.5 0 0 0 13 0"
        fill="none"
        stroke="var(--smiley-shade)"
        strokeWidth="1"
      />

      {mood === 'dead' ? (
        <g {...LINE}>
          <path d="M7 7.5l3 3M10 7.5l-3 3M14 7.5l3 3M17 7.5l-3 3" />
        </g>
      ) : mood === 'cool' ? (
        <path
          d="M4.5 8.5h15v1.2l-1.6 2.8h-3.4l-1.5-2.4h-2l-1.5 2.4H6.1L4.5 9.7Z"
          fill="var(--smiley-glasses)"
        />
      ) : (
        <g fill="var(--smiley-line)">
          <circle cx="8.6" cy="9.3" r="1.3" />
          <circle cx="15.4" cy="9.3" r="1.3" />
        </g>
      )}

      {mood === 'oh' ? (
        <circle cx="12" cy="16" r="2.3" fill="none" {...LINE} />
      ) : mood === 'dead' ? (
        <path d="M8 17.5q4-3.5 8 0" fill="none" {...LINE} />
      ) : (
        <path d="M7.5 14.5q4.5 4 9 0" fill="none" {...LINE} />
      )}
    </svg>
  )
}
