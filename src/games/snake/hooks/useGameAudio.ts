import { useCallback, useEffect, useRef } from 'react'

function createBgmOscillators(ctx: AudioContext, gainNode: GainNode) {
  const notes = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 392.0, 349.23]
  const noteDuration = 0.25
  let startTime = Math.max(ctx.currentTime + 0.05, scheduledUntil.get(ctx) ?? 0)

  function scheduleLoop() {
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = note
      noteGain.gain.setValueAtTime(0, startTime)
      noteGain.gain.linearRampToValueAtTime(0.08, startTime + 0.02)
      noteGain.gain.linearRampToValueAtTime(0.04, startTime + noteDuration * 0.7)
      noteGain.gain.linearRampToValueAtTime(0, startTime + noteDuration)
      osc.connect(noteGain)
      noteGain.connect(gainNode)
      osc.start(startTime)
      osc.stop(startTime + noteDuration)
      startTime += noteDuration
    }
  }

  for (let i = 0; i < 6; i++) {
    scheduleLoop()
  }
  scheduledUntil.set(ctx, startTime)
}

const scheduledUntil = new WeakMap<AudioContext, number>()

export function useGameAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (ctxRef.current) return
    try {
      const ctx = new AudioContext()
      const gain = ctx.createGain()
      gain.gain.value = 0.5
      gain.connect(ctx.destination)
      ctxRef.current = ctx

      createBgmOscillators(ctx, gain)

      intervalRef.current = setInterval(() => {
        if (ctx.state === 'running' && (scheduledUntil.get(ctx) ?? 0) - ctx.currentTime < 6) {
          createBgmOscillators(ctx, gain)
        }
      }, 1000)
    } catch {}
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
  }, [])

  useEffect(() => stop, [stop])

  return { start, stop }
}
