# NTH Arcade

A collection of small browser games built with Vite, React and TypeScript, with an English / Vietnamese UI.

| Route          | Page                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| `/`            | Dashboard to pick a game                                                                     |
| `/2048`        | 2048: arrow keys or swipe                                                                    |
| `/snake`       | Snake: arrow keys, Space to pause, swipe                                                     |
| `/minesweeper` | Minesweeper (classic Windows XP look): click, right-click / long-press to flag, F2 / F4 / F5 |
| `/flappy-bird` | Flappy Bird: Space / ↑ / click / tap to flap, P or Esc to pause                              |

## Getting started

```bash
yarn install
yarn dev        # http://localhost:8888
yarn test       # unit tests for the game logic (yarn test:watch for watch mode)
yarn lint
yarn build      # type-check + production build into dist/
```

## Project structure

```
src/
  app/                 router, RootLayout/
  styles/              global.css, colors.css (project-wide color tokens)
  i18n/                react-i18next setup: index.ts, locales/en.json, locales/vi.json
  dashboard/           game picker page (index.tsx) + components/GameCard/
  shared/              components/ (GameNav, LanguageToggle, icons), hooks/, storage.ts
  games/
    registry.ts        games listed on the dashboard
    2048/              index.tsx (game page), styles/colors.css, logic/, hooks/, components/
    snake/             index.tsx (game page), styles/colors.css, logic/, hooks/, components/
    minesweeper/       index.tsx (game page), styles/colors.css, logic/, hooks/, components/
    flappy-bird/       index.tsx (game page), styles/colors.css, logic/, render/ (canvas), hooks/, components/
```

### Conventions

- Every component lives in its own folder with an `index.tsx` and an `index.module.css` (CSS Modules).
- No hardcoded colors in components. Shared colors are declared in `src/styles/colors.css` (`--color-*`). Each game declares its own palette in `games/<game>/styles/colors.css`, scoped to a `.theme-<game>` class so games never override each other.
- All UI text goes through `useTranslation()` / `t('...')`. Keys are type-checked against `en.json`, and a test makes sure `vi.json` has exactly the same keys.
- Spell checking uses `cspell.json` (English + Vietnamese). Add project-specific words to its `words` list.

## Adding a game

1. Create `src/games/<game>/` with an `index.tsx` (the game page), `styles/colors.css` (a `.theme-<game>` class) and `components/Preview/` for the dashboard card.
2. Add a best-score key to `STORAGE_KEYS` in `src/shared/storage.ts`, and an accent color `--color-accent-<game>` to `src/styles/colors.css`.
3. Add `games.<game>.title`, `description` and `controls` to `src/i18n/locales/en.json` and `vi.json`.
4. Add an entry to `GAMES` in `src/games/registry.ts`.

## Deploying to Vercel

`vercel.json` builds with yarn and rewrites every route to `index.html`, so direct links such as `/2048` and `/snake` work.

- From GitHub: push the repo, then on vercel.com choose **Add New → Project** and import it. Vercel picks up `vercel.json` automatically.
- From the CLI: `npx vercel` for a preview deployment, or `npx vercel --prod` for production.
