import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import classes from './index.module.css'

interface InProgressDialogProps {
  onQuit: () => void
  onRestart: () => void
  onKeepPlaying: () => void
}

export function InProgressDialog({ onQuit, onRestart, onKeepPlaying }: InProgressDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      title={t('minesweeper.in_progress_title')}
      onClose={onKeepPlaying}
      footer={
        <div className={classes.actions}>
          <Button onClick={onQuit}>{t('minesweeper.quit_and_start')}</Button>
          <Button onClick={onRestart}>{t('minesweeper.restart_this_game')}</Button>
          <Button data-autofocus onClick={onKeepPlaying}>
            {t('minesweeper.keep_playing')}
          </Button>
        </div>
      }
    >
      <p className={classes.message}>{t('minesweeper.in_progress_message')}</p>
      <p className={classes.note}>{t('minesweeper.quit_note')}</p>
    </Dialog>
  )
}
