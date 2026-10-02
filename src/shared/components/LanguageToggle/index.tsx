import { LANGUAGES } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { GlobeIcon } from '../icons'
import classes from './index.module.css'

type LanguageToggleProps = {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, i18n } = useTranslation()

  return (
    <div
      className={`${classes.root} ${className ?? ''}`}
      role="group"
      aria-label={t('common.language')}
    >
      <GlobeIcon className={classes.icon} />
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={classes.option}
          aria-pressed={i18n.resolvedLanguage === code}
          onClick={() => i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
