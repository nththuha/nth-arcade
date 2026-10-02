import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import classes from './index.module.css'

const ITEMS = ['help1', 'help2', 'help3', 'help4', 'help5'] as const

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()

  return (
    <Dialog
      title={t('minesweeper.how_to_play')}
      onClose={onClose}
      footer={
        <Button data-autofocus onClick={onClose}>
          {t('minesweeper.close')}
        </Button>
      }
    >
      <ul className={classes.list}>
        {ITEMS.map((key) => (
          <li key={key}>{t(`minesweeper.${key}`)}</li>
        ))}
      </ul>
    </Dialog>
  )
}
