import { SIZE } from '../../config'
import type { TileProps } from '../../types'
import classes from './index.module.css'
import Message from '../Message'
import Tile from '../Tile'

type BoardProps = {
  tiles: TileProps[]
  won: boolean
  gameOver: boolean
  resetGame: () => void
  continueGame: () => void
}

export default function Board({ tiles, won, gameOver, resetGame, continueGame }: BoardProps) {
  return (
    <div className={classes.container}>
      {(gameOver || won) && <Message won={won} resetGame={resetGame} continueGame={continueGame} />}

      <div className={classes.tiles}>
        {tiles.map((tile) => (
          <Tile key={tile.id} {...tile} />
        ))}
      </div>

      <div className={classes.grid}>
        {Array.from({ length: SIZE * SIZE }, (_, index) => (
          <div key={index} className={classes.cell} />
        ))}
      </div>
    </div>
  )
}
