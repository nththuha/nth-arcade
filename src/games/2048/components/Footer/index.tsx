import { useTranslation } from 'react-i18next'
import { GITHUB_REPO_2048 } from '../../config'
import classes from './index.module.css'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={classes.footer}>
      <span>{t('common.made_by')}</span>
      <a href={GITHUB_REPO_2048} target="_blank" rel="noreferrer" aria-label="GitHub">
        <img src="/github-icon.svg" width={30} height={30} alt="" />
      </a>
    </footer>
  )
}
