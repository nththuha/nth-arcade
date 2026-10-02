import { GAMES } from '@/games/registry'
import { LanguageToggle } from '@/shared/components/LanguageToggle'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { loadNumber } from '@/shared/storage'
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
          {t('dashboard.selectGame')}
        </h2>

        <div className={classes.grid}>
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              bestScore={loadNumber(game.bestScoreKey)}
              style={{ '--accent': game.accent } as CSSProperties}
            />
          ))}

          <div className={classes.comingSoon}>
            <div className={classes.comingSoonIcon} aria-hidden="true">
              ?
            </div>
            <p className={classes.comingSoonTitle}>{t('dashboard.comingSoon')}</p>
            <p className={classes.comingSoonHint}>{t('dashboard.comingSoonHint')}</p>
          </div>
        </div>
      </main>

      <footer className={classes.footer}>{t('common.madeBy')}</footer>
    </div>
  )
}
