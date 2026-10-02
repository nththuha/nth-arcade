import { useTranslation } from 'react-i18next'
import { GaugeIcon } from '@/shared/components/icons'
import classes from './index.module.css'

interface SpeedSliderProps {
  speed: number
  onChange: (speed: number) => void
}

export function SpeedSlider({ speed, onChange }: SpeedSliderProps) {
  const { t } = useTranslation()

  return (
    <div className={classes.root}>
      <GaugeIcon className={classes.icon} />
      <label htmlFor="speed-slider" className={classes.label}>
        {t('snake.speed')}
      </label>
      <input
        id="speed-slider"
        type="range"
        min={1}
        max={10}
        step={1}
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        className={classes.slider}
      />
      <span className={classes.value}>{speed}</span>
    </div>
  )
}
