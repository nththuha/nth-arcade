import type { ReactNode } from 'react'
import classes from './index.module.css'

interface TitleBarProps {
  title: ReactNode
  icon?: ReactNode
  titleId?: string
  closeLabel: string
  onClose: () => void
  minimizeLabel?: string
  maximizeLabel?: string
}

export function TitleBar({
  title,
  icon,
  titleId,
  closeLabel,
  onClose,
  minimizeLabel,
  maximizeLabel,
}: TitleBarProps) {
  return (
    <div className={classes.bar}>
      {icon && <span className={classes.icon}>{icon}</span>}
      <span id={titleId} className={classes.title}>
        {title}
      </span>
      <div className={classes.buttons}>
        {minimizeLabel && (
          <span className={classes.button} title={minimizeLabel} aria-hidden="true">
            <span className={classes.minimize} />
          </span>
        )}
        {maximizeLabel && (
          <span className={classes.button} title={maximizeLabel} aria-hidden="true">
            <span className={classes.maximize} />
          </span>
        )}
        <button
          type="button"
          className={`${classes.button} ${classes.close}`}
          aria-label={closeLabel}
          title={closeLabel}
          onClick={onClose}
        >
          <span className={classes.cross} />
        </button>
      </div>
    </div>
  )
}
