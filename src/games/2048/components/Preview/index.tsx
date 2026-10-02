import { tileColor } from '../../config'
import '../../styles/colors.css'
import classes from './index.module.css'

// prettier-ignore
const VALUES = [
  [2,    0,    4,    0],
  [0,    8,    16,   32],
  [4,    64,   128,  256],
  [512,  1024, 2048, 2],
]

export default function Preview2048() {
  return (
    <div className={`theme-2048 ${classes.board}`} aria-hidden="true">
      {VALUES.flat().map((value, i) => (
        <div
          key={i}
          className={classes.cell}
          style={
            value
              ? {
                  backgroundColor: tileColor(value),
                  color: value <= 4 ? 'var(--text-color)' : 'var(--secondary-text)',
                }
              : undefined
          }
        >
          {value || ''}
        </div>
      ))}
    </div>
  )
}
