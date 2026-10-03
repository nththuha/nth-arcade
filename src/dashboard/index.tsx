import { GAMES } from '@/games/registry'
import { GithubIcon } from '@/shared/components/icons'
import { LanguageToggle } from '@/shared/components/LanguageToggle'
import { LINKS } from '@/shared/links'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { GameCard } from './components/GameCard'
import classes from './index.module.css'

export default function Dashboard() {
  const { t } = useTranslation()
  useDocumentTitle()

  return (
    <div className={classes.page}>
      <div className={classes.scanlines} aria-hidden="true" />

      <header className={classes.topBar}>
        <a
          className={classes.github}
          href={LINKS.GITHUB}
          target="_blank"
          rel="noreferrer"
          title={t('common.source_code')}
        >
          <GithubIcon className={classes.githubIcon} />
          {t('common.github')}
        </a>
        <LanguageToggle />
      </header>

      <main className={classes.main}>
        <section className={classes.hero}>
          <h1 className={classes.logo}>
            <span className={classes.logoTop}>NTH</span>
            <span className={classes.logoBottom}>ARCADE</span>
          </h1>
          <p className={classes.tagline}>{t('dashboard.tagline')}</p>
        </section>

        <h2 className={classes.sectionTitle}>
          <span className={classes.cursor} aria-hidden="true">
            ▶
          </span>
          {t('dashboard.select_game')}
        </h2>

        <div className={classes.grid}>
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              best={game.loadBest(t)}
              style={{ '--accent': game.accent } as CSSProperties}
            />
          ))}

          <div className={classes.comingSoon}>
            <div className={classes.comingSoonIcon} aria-hidden="true">
              ?
            </div>
            <p className={classes.comingSoonTitle}>{t('dashboard.coming_soon')}</p>
            <p className={classes.comingSoonHint}>{t('dashboard.coming_soon_hint')}</p>
          </div>
        </div>
      </main>

      <footer className={classes.footer}>
        <span>{t('common.made_by')}</span>
        <a className={classes.footerLink} href={LINKS.GITHUB} target="_blank" rel="noreferrer">
          <GithubIcon className={classes.githubIcon} />
          {t('common.source_code')}
        </a>
      </footer>
    </div>
  )
}
