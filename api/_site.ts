export const SITE_URL = 'https://nth-arcade.vercel.app'
export const GITHUB_URL = 'https://github.com/nththuha/nth-arcade'
export const ISSUES_URL = `${GITHUB_URL}/issues`

export interface GameInfo {
  id: string
  name: string
  path: string
  description: string
  controls: string
}

export const GAME_LIST: GameInfo[] = [
  {
    id: '2048',
    name: '2048',
    path: '/2048',
    description: 'Slide the tiles and merge equal numbers to reach 2048.',
    controls: 'Arrow keys · Swipe',
  },
  {
    id: 'snake',
    name: 'Snake',
    path: '/snake',
    description: 'Guide the neon snake, eat the food and grow as long as you can.',
    controls: 'Arrow keys · Space · Swipe',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    path: '/minesweeper',
    description:
      'Clear the minefield without setting off a mine. Numbers tell you how many mines are hiding nearby.',
    controls: 'Click · Right-click · Long-press',
  },
  {
    id: 'flappy-bird',
    name: 'Flappy Bird',
    path: '/flappy-bird',
    description: 'Tap to flap through the gaps between the pipes. One touch is all it takes.',
    controls: 'Space · ↑ · Click · Tap',
  },
  {
    id: 'dino',
    name: 'Dino',
    path: '/dino',
    description: 'Run, jump and duck past cacti and birds in the classic offline dinosaur game.',
    controls: 'Space · ↑ · ↓ · Tap',
  },
  {
    id: 'tetris',
    name: 'Tetris',
    path: '/tetris',
    description: 'Stack falling blocks, clear lines and chase a higher score as the speed rises.',
    controls: '← → ↓ · ↑ / X / Z · Space · Swipe',
  },
  {
    id: 'gomoku',
    name: 'Gomoku',
    path: '/gomoku',
    description: 'Get five in a row on a 15×15 board against the computer or a friend.',
    controls: 'Click · Tap',
  },
]

export const gameUrl = (game: GameInfo) => `${SITE_URL}${game.path}`

export const listGames = () => GAME_LIST.map((game) => ({ ...game, url: gameUrl(game) }))

export const findGame = (id: string) => listGames().find((game) => game.id === id)
