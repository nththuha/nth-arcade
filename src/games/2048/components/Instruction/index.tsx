import { Trans } from 'react-i18next'
import classes from './index.module.css'

export default function Instruction() {
  return (
    <p className={classes.instruction}>
      <Trans i18nKey="game2048.instruction" components={{ b: <strong /> }} />
    </p>
  )
}
