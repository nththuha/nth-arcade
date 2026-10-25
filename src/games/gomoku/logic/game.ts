export const SIZE = 15
export const WIN = 5

export type Player = 1 | 2 // 1 = black (moves first), 2 = white
export type Cell = 0 | Player
export type Board = Cell[][]
export interface Move {
  row: number
  col: number
  player: Player
}
export type Point = [row: number, col: number]

export const DIRECTIONS: Point[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

export const other = (p: Player): Player => (p === 1 ? 2 : 1)

export const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(0))

export const inside = (r: number, c: number) => r >= 0 && c >= 0 && r < SIZE && c < SIZE

export function boardOf(moves: Move[]): Board {
  const board = emptyBoard()
  for (const { row, col, player } of moves) board[row][col] = player
  return board
}

/** Cells of the line (5 or more in a row) through the last move, or null. Opponent stones on both ends kill it. */
export function winLine(board: Board, row: number, col: number): Point[] | null {
  const player = board[row][col]
  if (!player) return null
  for (const [dr, dc] of DIRECTIONS) {
    const line: Point[] = [[row, col]]
    let blocked = 0
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let c = col + dc * sign
      while (inside(r, c) && board[r][c] === player) {
        line.push([r, c])
        r += dr * sign
        c += dc * sign
      }
      if (inside(r, c) && board[r][c] === other(player)) blocked++
    }
    if (line.length >= WIN && blocked < 2) return line
  }
  return null
}
