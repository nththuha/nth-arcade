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
      title={t('minesweeper.inProgressTitle')}
      onClose={onKeepPlaying}
      footer={
        <div className={classes.actions}>
          <Button onClick={onQuit}>{t('minesweeper.quitAndStart')}</Button>
          <Button onClick={onRestart}>{t('minesweeper.restartThisGame')}</Button>
          <Button data-autofocus onClick={onKeepPlaying}>
            {t('minesweeper.keepPlaying')}
          </Button>
        </div>
      }
    >
      <p className={classes.message}>{t('minesweeper.inProgressMessage')}</p>
      <p className={classes.note}>{t('minesweeper.quitNote')}</p>
    </Dialog>
  )
}
