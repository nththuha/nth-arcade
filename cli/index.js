const BASE_URL = 'https://nth-arcade.vercel.app'

const USAGE = `Usage:
  nth-arcade-cli list [--json]
  nth-arcade-cli get <id> [--json]`

const formatGame = (game) =>
  `${game.name} (${game.id})\n  ${game.description}\n  Controls: ${game.controls}\n  Play: ${game.url}`

export async function run(args, { fetchImpl = fetch, log = console.log, baseUrl = BASE_URL } = {}) {
  const asJson = args.includes('--json')
  const [command, id] = args.filter((arg) => arg !== '--json')
  const path =
    command === 'list'
      ? '/api/games'
      : command === 'get' && id
        ? `/api/games/${encodeURIComponent(id)}`
        : null

  if (!path) {
    log(USAGE)
    return 1
  }

  const response = await fetchImpl(`${baseUrl}${path}`, { headers: { Accept: 'application/json' } })
  const body = await response.json()

  if (!response.ok) {
    log(`Error: ${body.error.message} ${body.error.hint}`)
    return 1
  }
  if (asJson) log(JSON.stringify(body, null, 2))
  else log((body.games ?? [body]).map(formatGame).join('\n\n'))
  return 0
}
