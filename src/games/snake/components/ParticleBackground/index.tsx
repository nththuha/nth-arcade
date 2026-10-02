import classes from './index.module.css'

const PARTICLE_COLORS = [
  'var(--neon-green)',
  'var(--neon-cyan)',
  'var(--neon-purple)',
  'var(--neon-blue)',
]

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 10,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
}))

export function ParticleBackground() {
  return (
    <div className={classes.root} aria-hidden="true">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className={classes.particle}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
