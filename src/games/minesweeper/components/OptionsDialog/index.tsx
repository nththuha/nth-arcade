import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CUSTOM_LIMITS,
  DIFFICULTIES,
  RANKED_DIFFICULTIES,
  clampCustom,
  maxMines,
} from '../../config'
import type { BoardSize, DifficultyId, Settings } from '../../types'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import classes from './index.module.css'

interface OptionsDialogProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export function OptionsDialog({ settings, onSave, onClose }: OptionsDialogProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(settings)
  const custom = draft.custom
  const isCustom = draft.difficulty === 'custom'

  const setCustom = (key: keyof BoardSize, value: string) =>
    setDraft({ ...draft, custom: { ...custom, [key]: Number(value) } })

  const difficultyOption = (id: DifficultyId, detail?: string) => (
    <label key={id} className={classes.radio}>
      <input
        type="radio"
        name="difficulty"
        checked={draft.difficulty === id}
        onChange={() => setDraft({ ...draft, difficulty: id })}
      />
      <span>
        <span className={classes.radioLabel}>{t(`minesweeper.${id}`)}</span>
        {detail && <span className={classes.detail}>{detail}</span>}
      </span>
    </label>
  )

  const fields = [
    ['rows', t('minesweeper.height', { min: CUSTOM_LIMITS.minRows, max: CUSTOM_LIMITS.maxRows })],
    ['cols', t('minesweeper.width', { min: CUSTOM_LIMITS.minCols, max: CUSTOM_LIMITS.maxCols })],
    [
      'mines',
      t('minesweeper.mines', {
        min: CUSTOM_LIMITS.minMines,
        max: maxMines(clampCustom(custom).rows, clampCustom(custom).cols),
      }),
    ],
  ] as const

  const checkbox = (key: 'animations' | 'questionMarks') => (
    <label className={classes.checkbox}>
      <input
        type="checkbox"
        checked={draft[key]}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
      />
      {t(`minesweeper.${key}`)}
    </label>
  )

  return (
    <Dialog
      title={t('minesweeper.options')}
      onClose={onClose}
      footer={
        <>
          <Button
            data-autofocus
            onClick={() => onSave({ ...draft, custom: clampCustom(draft.custom) })}
          >
            {t('minesweeper.ok')}
          </Button>
          <Button onClick={onClose}>{t('minesweeper.cancel')}</Button>
        </>
      }
    >
      <fieldset className={classes.group}>
        <legend className={classes.legend}>{t('minesweeper.difficulty')}</legend>
        <div className={classes.difficulties}>
          <div className={classes.column}>
            {RANKED_DIFFICULTIES.map((id) =>
              difficultyOption(id, t('minesweeper.difficultyDetail', { ...DIFFICULTIES[id] })),
            )}
          </div>
          <div className={classes.column}>
            {difficultyOption('custom')}
            {fields.map(([key, label]) => (
              <label key={key} className={classes.field}>
                <span>{label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={classes.input}
                  disabled={!isCustom}
                  value={custom[key]}
                  onChange={(e) => setCustom(key, e.target.value)}
                  onBlur={() => setDraft({ ...draft, custom: clampCustom(custom) })}
                />
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className={classes.checkboxes}>
        {checkbox('animations')}
        {checkbox('questionMarks')}
      </div>
    </Dialog>
  )
}
