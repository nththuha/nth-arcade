import { SITE_URL, findGame, listGames } from './_site.js'

const SUPPORTED_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']
const SERVER_INFO = { name: 'nth-arcade', title: 'NTH Arcade', version: '1.0.0' }

const TOOLS = [
  {
    name: 'list_games',
    title: 'List games',
    description: 'List every game on NTH Arcade with its description, controls and play URL.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_game',
    title: 'Get game',
    description: 'Get one NTH Arcade game by id, including its controls and play URL.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Game id.',
          enum: listGames().map((game) => game.id),
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
]

type RpcId = string | number | null

const reply = (id: RpcId, result: unknown) => rpc({ jsonrpc: '2.0', id, result })

const fail = (id: RpcId, code: number, message: string, status = 200) =>
  rpc({ jsonrpc: '2.0', id, error: { code, message } }, status)

const rpc = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const toolResult = (value: unknown, isError = false) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  ...(isError ? {} : { structuredContent: value }),
  isError,
})

function callTool(name: string, args: Record<string, unknown>) {
  if (name === 'list_games') return toolResult({ games: listGames() })
  const id = typeof args.id === 'string' ? args.id : ''
  const game = findGame(id)
  return game
    ? toolResult(game)
    : toolResult(
        { error: `No game with id "${id}".`, validIds: listGames().map((item) => item.id) },
        true,
      )
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return new Response('MCP endpoint: send JSON-RPC 2.0 messages with HTTP POST.', {
        status: 405,
        headers: { Allow: 'POST', 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    let message: {
      jsonrpc?: string
      id?: RpcId
      method?: string
      params?: Record<string, unknown>
    }
    try {
      message = (await request.json()) as typeof message
    } catch {
      return fail(null, -32700, 'Parse error', 400)
    }
    if (
      typeof message !== 'object' ||
      message === null ||
      Array.isArray(message) ||
      message.jsonrpc !== '2.0' ||
      typeof message.method !== 'string'
    ) {
      return fail(null, -32600, 'Invalid Request', 400)
    }

    if (message.id === undefined) return new Response(null, { status: 202 })

    const { id, method, params = {} } = message
    switch (method) {
      case 'initialize': {
        const requested = params.protocolVersion
        const protocolVersion =
          typeof requested === 'string' && SUPPORTED_VERSIONS.includes(requested)
            ? requested
            : SUPPORTED_VERSIONS[0]
        return reply(id, {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions: `Read-only catalog of the browser games on ${SITE_URL}. Use list_games to discover games and get_game for one game's controls and play URL.`,
        })
      }
      case 'ping':
        return reply(id, {})
      case 'tools/list':
        return reply(id, { tools: TOOLS })
      case 'tools/call': {
        const name = params.name
        if (typeof name !== 'string' || !TOOLS.some((tool) => tool.name === name)) {
          return fail(id, -32602, `Unknown tool: ${String(name)}`)
        }
        return reply(id, callTool(name, (params.arguments as Record<string, unknown>) ?? {}))
      }
      default:
        return fail(id, -32601, `Method not found: ${method}`)
    }
  },
}
