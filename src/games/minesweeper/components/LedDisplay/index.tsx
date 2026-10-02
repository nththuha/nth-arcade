import classes from './index.module.css'

const SEGMENTS = {
  a: '2,1 11,1 9,3 4,3',
  b: '12,2 12,11 10,10 10,4',
  c: '12,12 12,21 10,19 10,13',
  d: '2,22 11,22 9,20 4,20',
  e: '1,12 3,13 3,19 1,21',
  f: '1,2 3,4 3,10 1,11',
  g: '2,11.5 4,10.5 9,10.5 11,11.5 9,12.5 4,12.5',
} as const

type Segment = keyof typeof SEGMENTS

const GLYPHS: Record<string, Segment[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'd', 'c'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
}

function formatValue(value: number) {
  const clamped = Math.max(-99, Math.min(999, value))
  return clamped < 0 ? `-${String(-clamped).padStart(2, '0')}` : String(clamped).padStart(3, '0')
}

function Digit({ char }: { char: string }) {
  const lit = new Set(GLYPHS[char] ?? [])
  return (
    <svg viewBox="0 0 13 23" className={classes.digit} aria-hidden="true">
      {(Object.keys(SEGMENTS) as Segment[]).map((segment) => (
        <polygon
          key={segment}
          points={SEGMENTS[segment]}
          className={lit.has(segment) ? classes.on : classes.off}
        />
      ))}
    </svg>
  )
}

export function LedDisplay({ value, label }: { value: number; label: string }) {
  const text = formatValue(value)
  return (
    <div className={classes.display} role="status" aria-label={`${label}: ${value}`}>
      {text.split('').map((char, i) => (
        <Digit key={i} char={char} />
      ))}
    </div>
  )
}
