import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={classes.footer}>
      <span>{t('common.made_by')}</span>
    </footer>
  )
}
