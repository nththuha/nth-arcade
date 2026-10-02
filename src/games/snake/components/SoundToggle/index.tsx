import { useTranslation } from 'react-i18next'
import { VolumeOffIcon, VolumeOnIcon } from '@/shared/components/icons'
import classes from './index.module.css'

interface SoundToggleProps {
  muted: boolean
  onToggle: () => void
}

export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${classes.button} ${muted ? classes.muted : classes.on}`}
      aria-label={muted ? t('snake.unmute') : t('snake.mute')}
      aria-pressed={!muted}
    >
      {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
    </button>
  )
}
