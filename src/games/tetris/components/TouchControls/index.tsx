import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsDownIcon,
  RotateCcwIcon,
} from '@/shared/components/icons'
import type { PointerEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './index.module.css'

interface ControlProps {
  label: string
  children: ReactNode
  onPress: () => void
  onRelease?: () => void
  wide?: boolean
}

function Control({ label, children, onPress, onRelease, wide }: ControlProps) {
  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    onPress()
  }

  return (
    <button
      type="button"
      className={`${classes.control} ${wide ? classes.wide : ''}`}
      aria-label={label}
      title={label}
      onPointerDown={press}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

interface TouchControlsProps {
  group: 'move' | 'action'
  className?: string
  onMove: (direction: -1 | 1) => void
  onMoveEnd: (direction: -1 | 1) => void
  onSoftDrop: (on: boolean) => void
  onRotate: (direction: 1 | -1) => void
  onHardDrop: () => void
  onHold: () => void
}

export function TouchControls({
  group,
  className,
  onMove,
  onMoveEnd,
  onSoftDrop,
  onRotate,
  onHardDrop,
  onHold,
}: TouchControlsProps) {
  const { t } = useTranslation()

  if (group === 'move') {
    return (
      <div className={`${classes.group} ${className ?? ''}`}>
        <Control
          label={t('tetris.move_left')}
          onPress={() => onMove(-1)}
          onRelease={() => onMoveEnd(-1)}
        >
          <ChevronLeftIcon className={classes.icon} />
        </Control>
        <Control
          label={t('tetris.soft_drop')}
          onPress={() => onSoftDrop(true)}
          onRelease={() => onSoftDrop(false)}
        >
          <ChevronDownIcon className={classes.icon} />
        </Control>
        <Control
          label={t('tetris.move_right')}
          onPress={() => onMove(1)}
          onRelease={() => onMoveEnd(1)}
        >
          <ChevronRightIcon className={classes.icon} />
        </Control>
      </div>
    )
  }

  return (
    <div className={`${classes.group} ${className ?? ''}`}>
      <Control label={t('tetris.hold')} onPress={onHold}>
        <span className={classes.text}>{t('tetris.hold')}</span>
      </Control>
      <Control label={t('tetris.rotate_left')} onPress={() => onRotate(-1)}>
        <RotateCcwIcon className={classes.icon} />
      </Control>
      <Control label={t('tetris.rotate_right')} onPress={() => onRotate(1)}>
        <RotateCcwIcon className={`${classes.icon} ${classes.mirrored}`} />
      </Control>
      <Control label={t('tetris.hard_drop')} onPress={onHardDrop} wide>
        <ChevronsDownIcon className={classes.icon} />
      </Control>
    </div>
  )
}
