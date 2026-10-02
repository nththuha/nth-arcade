import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TitleBar } from '../TitleBar'
import classes from './index.module.css'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  className?: string
}

export function Dialog({ title, onClose, children, footer, className }: DialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    const target =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel?.querySelector<HTMLElement>(`.${classes.content} button`)
    target?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className={classes.overlay}>
      <div
        ref={panelRef}
        className={classes.window}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <TitleBar
          title={title}
          titleId={titleId}
          closeLabel={t('minesweeper.close')}
          onClose={onClose}
        />
        <div className={`${classes.content} ${className ?? ''}`}>
          {children}
          <div className={classes.footer}>{footer}</div>
        </div>
      </div>
    </div>
  )
}
