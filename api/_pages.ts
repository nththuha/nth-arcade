import { GAME_LIST, GITHUB_URL, ISSUES_URL, SITE_URL, gameUrl } from './_site.js'

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; text: string }
  | { type: 'list'; items: { text: string; href?: string }[] }

export interface Page {
  path: string
  title: string
  description: string
  blocks: Block[]
}

const gameLinks = GAME_LIST.map((game) => ({
  text: `${game.name}: ${game.description}`,
  href: gameUrl(game),
}))

const NAV_LINKS = [
  { text: 'Home', href: '/' },
  { text: 'About', href: '/about' },
  { text: 'Contact', href: '/contact' },
  { text: 'Privacy', href: '/privacy' },
  { text: 'API docs', href: '/docs' },
  { text: 'Developers', href: '/developers' },
]

export const PAGES: Page[] = [
  {
    path: '/',
    title: 'NTH Arcade: free browser games',
    description:
      'Play 2048, Snake, Minesweeper, Flappy Bird, Dino, Tetris and Gomoku in your browser.',
    blocks: [
      {
        type: 'p',
        text: 'NTH Arcade is a free collection of classic games that run in your browser, with an English and Vietnamese interface. No account, no install, and your best scores stay on your device.',
      },
      { type: 'h2', text: 'Games' },
      { type: 'list', items: gameLinks },
      { type: 'h2', text: 'More' },
      { type: 'list', items: NAV_LINKS.slice(1) },
      {
        type: 'list',
        items: [
          { text: 'llms.txt', href: '/llms.txt' },
          { text: 'OpenAPI', href: '/openapi.json' },
        ],
      },
    ],
  },
  {
    path: '/about',
    title: 'About NTH Arcade',
    description: 'Who makes NTH Arcade and why it exists.',
    blocks: [
      {
        type: 'p',
        text: 'NTH Arcade is a small, independent project by NTH Thu Hà. It is a set of classic games rebuilt from scratch with React and TypeScript, designed to load instantly, work on desktop and phones, and stay fun without ads, accounts or tracking.',
      },
      { type: 'h2', text: 'What you can play' },
      { type: 'list', items: gameLinks },
      { type: 'h2', text: 'How it is built' },
      {
        type: 'p',
        text: 'The whole site is a single page application built with Vite, React and TypeScript, hosted on Vercel. Every game keeps its logic in small tested modules, and the interface is available in English and Vietnamese. The source code is open and free to read.',
      },
      { type: 'list', items: [{ text: 'Source code on GitHub', href: GITHUB_URL }] },
    ],
  },
  {
    path: '/contact',
    title: 'Contact NTH Arcade',
    description: 'How to report a bug, suggest a game or reach the maker of NTH Arcade.',
    blocks: [
      {
        type: 'p',
        text: 'The best way to reach NTH Arcade is through the public issue tracker on GitHub. Open an issue to report a bug, suggest a new game, ask a question about the API or tell us about something that feels off on your device.',
      },
      { type: 'list', items: [{ text: 'Open an issue on GitHub', href: ISSUES_URL }] },
      { type: 'h2', text: 'What to include' },
      {
        type: 'p',
        text: 'For bugs, please include the game, your browser and device, and the steps that led to the problem. For API or MCP questions, include the request you sent and the response you received. Replies are given on a best-effort basis since this is a personal project.',
      },
      { type: 'h2', text: 'Language' },
      { type: 'p', text: 'You can write in English or Vietnamese.' },
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: 'What NTH Arcade stores and what it does not.',
    blocks: [
      {
        type: 'p',
        text: 'NTH Arcade does not have accounts, does not ask for personal information and does not use advertising or analytics trackers. This page explains the little data that does exist.',
      },
      { type: 'h2', text: 'Data stored in your browser' },
      {
        type: 'p',
        text: 'Best scores, Minesweeper settings and statistics, and your language choice are saved in your browser localStorage so they are there next time you visit. This data never leaves your device, and you can erase it at any time by clearing site data in your browser.',
      },
      { type: 'h2', text: 'Third parties' },
      {
        type: 'p',
        text: 'The site is hosted on Vercel, which may keep standard server logs such as IP address and user agent for security and operations. Fonts are loaded from Google Fonts, which receives your IP address when the font files are requested.',
      },
      { type: 'h2', text: 'API and MCP server' },
      {
        type: 'p',
        text: 'The public API and MCP server are read-only, require no credentials and do not store the requests you send.',
      },
      { type: 'h2', text: 'Questions' },
      { type: 'list', items: [{ text: 'Contact', href: '/contact' }] },
    ],
  },
  {
    path: '/docs',
    title: 'NTH Arcade API documentation',
    description: 'Reference for the public, read-only NTH Arcade REST API.',
    blocks: [
      {
        type: 'p',
        text: 'The NTH Arcade API is a public, read-only REST API that describes the games on this site. It needs no authentication and returns JSON. Errors are always JSON objects with a stable code, a message and a hint for fixing the request.',
      },
      { type: 'h2', text: 'Base URL' },
      { type: 'code', text: SITE_URL },
      { type: 'h2', text: 'GET /api/games' },
      { type: 'p', text: 'Returns every game with id, name, path, description, controls and url.' },
      { type: 'code', text: `curl ${SITE_URL}/api/games` },
      { type: 'h2', text: 'GET /api/games/{id}' },
      {
        type: 'p',
        text: 'Returns one game. Valid ids are 2048, snake, minesweeper, flappy-bird, dino, tetris and gomoku.',
      },
      { type: 'code', text: `curl ${SITE_URL}/api/games/tetris` },
      { type: 'h2', text: 'Errors' },
      {
        type: 'p',
        text: 'Unknown ids return HTTP 404 and unsupported methods return HTTP 405 with this body shape:',
      },
      {
        type: 'code',
        text: '{"error":{"code":"game_not_found","message":"No game with id \\"x\\" exists.","hint":"Valid ids: ..."}}',
      },
      { type: 'h2', text: 'Machine-readable descriptions' },
      {
        type: 'list',
        items: [
          { text: 'OpenAPI 3.1 specification', href: '/openapi.json' },
          { text: 'MCP server (Streamable HTTP)', href: '/api/mcp' },
          { text: 'MCP manifest', href: '/.well-known/mcp' },
          { text: 'llms.txt', href: '/llms.txt' },
        ],
      },
    ],
  },
  {
    path: '/developers',
    title: 'NTH Arcade developers',
    description: 'Quickstart for the NTH Arcade API, MCP server and CLI.',
    blocks: [
      {
        type: 'p',
        text: 'Everything developers can use lives here: a read-only REST API, an MCP server for AI agents and a small command line tool. There are no API keys and no sign-up because the data is public and read-only, and the production API is also the sandbox: calling it cannot change anything.',
      },
      { type: 'h2', text: 'Quickstart' },
      { type: 'code', text: `curl ${SITE_URL}/api/games` },
      { type: 'h2', text: 'MCP server' },
      {
        type: 'p',
        text: `Point any MCP client that supports Streamable HTTP at ${SITE_URL}/api/mcp. Tools: list_games and get_game.`,
      },
      { type: 'h2', text: 'CLI' },
      { type: 'code', text: 'npx nth-arcade-cli list\nnpx nth-arcade-cli get tetris' },
      { type: 'p', text: 'The CLI source is in the cli folder of the GitHub repository.' },
      { type: 'h2', text: 'Reference' },
      {
        type: 'list',
        items: [
          { text: 'API documentation', href: '/docs' },
          { text: 'OpenAPI specification', href: '/openapi.json' },
          { text: 'llms.txt', href: '/llms.txt' },
          { text: 'Source code', href: GITHUB_URL },
        ],
      },
    ],
  },
  ...GAME_LIST.map((game): Page => ({
    path: game.path,
    title: `${game.name} on NTH Arcade`,
    description: game.description,
    blocks: [
      { type: 'p', text: game.description },
      { type: 'p', text: `Controls: ${game.controls}` },
      { type: 'list', items: [{ text: `Play ${game.name}`, href: gameUrl(game) }] },
    ],
  })),
]

const link = (href: string) => (href.startsWith('/') ? `${SITE_URL}${href}` : href)

export function toMarkdown(page: Page) {
  const body = page.blocks.map((block) => {
    switch (block.type) {
      case 'h2':
        return `## ${block.text}`
      case 'p':
        return block.text
      case 'code':
        return `\`\`\`\n${block.text}\n\`\`\``
      case 'list':
        return block.items
          .map((item) => `- ${item.href ? `[${item.text}](${link(item.href)})` : item.text}`)
          .join('\n')
    }
  })
  return [`# ${page.title}`, ...body].join('\n\n') + '\n'
}

const escapeHtml = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`)

export function toHtml(page: Page, status = 200) {
  const body = page.blocks
    .map((block) => {
      switch (block.type) {
        case 'h2':
          return `<h2>${escapeHtml(block.text)}</h2>`
        case 'p':
          return `<p>${escapeHtml(block.text)}</p>`
        case 'code':
          return `<pre><code>${escapeHtml(block.text)}</code></pre>`
        case 'list':
          return `<ul>${block.items
            .map((item) =>
              item.href
                ? `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.text)}</a></li>`
                : `<li>${escapeHtml(item.text)}</li>`,
            )
            .join('')}</ul>`
      }
    })
    .join('\n')
  const nav = NAV_LINKS.map((item) => `<a href="${item.href}">${item.text}</a>`).join(' · ')
  const canonical = status === 200 ? `<link rel="canonical" href="${SITE_URL}${page.path}">` : ''
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)} · NTH Arcade</title>
<meta name="description" content="${escapeHtml(page.description)}">
${canonical}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
body{margin:0;background:#0b0820;color:#e8e6ff;font:16px/1.6 Inter,system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:32px 16px}
a{color:#ffe14d}
pre{background:#150f35;padding:12px;overflow-x:auto;border-radius:6px}
nav,footer{max-width:720px;margin:0 auto;padding:16px}
</style>
</head>
<body>
<nav>${nav}</nav>
<main>
<h1>${escapeHtml(page.title)}</h1>
${body}
</main>
</body>
</html>
`
}

export const notFoundPage = (path: string): Page => ({
  path,
  title: 'Page not found',
  description: 'The requested page does not exist.',
  blocks: [
    {
      type: 'p',
      text: `No page exists at ${path}. Check the address, or use the links below to find what you need.`,
    },
    {
      type: 'list',
      items: [
        { text: 'Home', href: '/' },
        { text: 'llms.txt: guide for AI agents', href: '/llms.txt' },
        { text: 'Sitemap', href: '/sitemap.xml' },
        { text: 'API documentation', href: '/docs' },
      ],
    },
  ],
})
