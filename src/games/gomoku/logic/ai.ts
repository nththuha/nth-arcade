import { DIRECTIONS, SIZE, inside, other, type Board, type Player, type Point } from './game'

// Value of the line a stone would make, by length and open ends.
const FIVE = 1_000_000
const PATTERN: Record<number, [closed: number, open: number]> = {
  4: [3_000, 20_000],
  3: [100, 1_500],
  2: [10, 100],
  1: [1, 5],
}

function lineScore(board: Board, row: number, col: number, player: Player): number {
  let total = 0
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    let open = 0
    let blocked = 0
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let c = col + dc * sign
      while (inside(r, c) && board[r][c] === player) {
        count++
        r += dr * sign
        c += dc * sign
      }
      if (inside(r, c) && board[r][c] === 0) open++
      else if (inside(r, c)) blocked++
    }
    if (count >= 5) {
      if (blocked < 2) return FIVE
      continue
    }
    if (open > 0) total += PATTERN[count][open - 1]
  }
  return total
}

/** Empty cells within 2 steps of any stone (or the centre on an empty board). */
function candidates(board: Board): Point[] {
  const out: Point[] = []
  let any = false
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) {
        any = true
        continue
      }
      near: for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          if (inside(r + dr, c + dc) && board[r + dr][c + dc] !== 0) {
            out.push([r, c])
            break near
          }
    }
  }
  const mid = Math.floor(SIZE / 2)
  return any ? out : [[mid, mid]]
}

/** One-ply heuristic: win now > block loss > best of attack + defence, with slight noise. */
export function aiMove(board: Board, me: Player, random = Math.random): Point | null {
  let best: Point | null = null
  let bestScore = -Infinity
  const mid = (SIZE - 1) / 2
  for (const [r, c] of candidates(board)) {
    const attack = lineScore(board, r, c, me)
    const defend = lineScore(board, r, c, other(me))
    const centre = (SIZE - Math.abs(r - mid) - Math.abs(c - mid)) / SIZE
    const score = attack * 1.1 + defend + centre + random() * 0.5
    if (score > bestScore) {
      bestScore = score
      best = [r, c]
    }
  }
  return best
}
