import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import gameHandler from './games/[id]'
import gamesHandler from './games/index'
import mcp from './mcp'
import page from './page'
import { GAME_LIST } from './_site'

const get = (url: string, accept?: string) =>
  new Request(`https://x.test${url}`, accept ? { headers: { Accept: accept } } : undefined)

const rpc = (body: unknown) =>
  mcp.fetch(new Request('https://x.test/api/mcp', { method: 'POST', body: JSON.stringify(body) }))

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

describe('games API', () => {
  it('lists every game', async () => {
    const response = await gamesHandler.fetch(get('/api/games'))
    expect(response.status).toBe(200)
    expect((await response.json()).games).toHaveLength(GAME_LIST.length)
  })

  it('returns one game', async () => {
    const response = await gameHandler.fetch(get('/api/games/tetris'))
    expect((await response.json()).url).toBe('https://nth-arcade.vercel.app/tetris')
  })

  it('returns structured JSON errors', async () => {
    const missing = await gameHandler.fetch(get('/api/games/nope'))
    expect(missing.status).toBe(404)
    expect(missing.headers.get('content-type')).toContain('application/json')
    const { error } = await missing.json()
    expect(error.code).toBe('game_not_found')
    expect(error.hint).toContain('tetris')

    const post = await gamesHandler.fetch(
      new Request('https://x.test/api/games', { method: 'POST' }),
    )
    expect(post.status).toBe(405)
    expect(post.headers.get('allow')).toBe('GET')
    expect((await post.json()).error.code).toBe('method_not_allowed')
  })
})

describe('page handler', () => {
  it('serves markdown with Vary: Accept when negotiated', async () => {
    const response = await page.fetch(get('/api/page?path=/', 'text/markdown'))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    expect(response.headers.get('vary')).toBe('Accept')
    expect(await response.text()).toContain('# NTH Arcade')
  })

  it('serves html for info pages', async () => {
    const response = await page.fetch(get('/api/page?path=/about', 'text/html'))
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(await response.text()).toContain('<h1>About NTH Arcade</h1>')
  })

  it('falls back to the request pathname', async () => {
    const response = await page.fetch(get('/privacy/'))
    expect(response.status).toBe(200)
  })

  it('returns a real 404 with a markdown body for unknown paths', async () => {
    const response = await page.fetch(get('/api/page?path=/nothing-here', 'text/markdown'))
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    const body = await response.text()
    expect(body).toContain('/nothing-here')
    expect(body).toContain('llms.txt')
  })

  it('returns an html 404 and escapes the path', async () => {
    const response = await page.fetch(get('/api/page?path=/<script>'))
    expect(response.status).toBe(404)
    expect(await response.text()).not.toContain('<script>')
  })

  it('returns JSON 404 for unknown api paths', async () => {
    const response = await page.fetch(get('/api/page?path=/api/unknown'))
    expect(response.status).toBe(404)
    expect((await response.json()).error.code).toBe('endpoint_not_found')
  })

  it('keeps trust pages above 500 characters', async () => {
    for (const path of ['/about', '/contact', '/privacy', '/docs', '/developers']) {
      const html = await (await page.fetch(get(`/api/page?path=${path}`))).text()
      const text = html.replace(/<style[\s\S]*?<\/style>|<[^>]+>/g, ' ')
      expect(text.replace(/\s+/g, ' ').length).toBeGreaterThan(500)
    }
  })
})

describe('MCP server', () => {
  it('negotiates the protocol version on initialize', async () => {
    const response = await rpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 't', version: '1' },
      },
    })
    const body = await response.json()
    expect(body.result.protocolVersion).toBe('2025-06-18')
    expect(body.result.serverInfo.name).toBe('nth-arcade')
    expect(body.result.capabilities.tools).toBeDefined()
  })

  it('falls back to the latest version for unknown ones', async () => {
    const body = await (
      await rpc({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '1999-01-01' },
      })
    ).json()
    expect(body.result.protocolVersion).toBe('2025-11-25')
  })

  it('accepts notifications with 202', async () => {
    const response = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' })
    expect(response.status).toBe(202)
  })

  it('lists and calls tools', async () => {
    const list = await (await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).json()
    expect(list.result.tools.map((tool: { name: string }) => tool.name)).toEqual([
      'list_games',
      'get_game',
    ])

    const call = await (
      await rpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'get_game', arguments: { id: 'dino' } },
      })
    ).json()
    expect(call.result.isError).toBe(false)
    expect(call.result.structuredContent.id).toBe('dino')

    const bad = await (
      await rpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'get_game', arguments: { id: 'zzz' } },
      })
    ).json()
    expect(bad.result.isError).toBe(true)
  })

  it('returns JSON-RPC errors', async () => {
    expect((await (await rpc({ jsonrpc: '2.0', id: 5, method: 'nope' })).json()).error.code).toBe(
      -32601,
    )
    expect(
      (
        await (
          await rpc({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'zzz' } })
        ).json()
      ).error.code,
    ).toBe(-32602)
    const malformed = await mcp.fetch(
      new Request('https://x.test/api/mcp', { method: 'POST', body: '{' }),
    )
    expect(malformed.status).toBe(400)
    expect((await malformed.json()).error.code).toBe(-32700)
    const invalid = await rpc([])
    expect((await invalid.json()).error.code).toBe(-32600)
  })

  it('rejects GET', async () => {
    const response = await mcp.fetch(get('/api/mcp'))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  })
})

describe('static machine-readable files', () => {
  const spec = JSON.parse(read('public/openapi.json'))
  const operations = Object.values<Record<string, { operationId: string; description: string }>>(
    spec.paths,
  ).flatMap(Object.values)

  it('describes every operation', () => {
    const ids = operations.map((operation) => operation.operationId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(['listGames', 'getGame'])
    operations.forEach((operation) => expect(operation.description.length).toBeGreaterThan(10))
  })

  it('lists every game id in the spec enum', () => {
    const { enum: ids } = spec.paths['/api/games/{id}'].get.parameters[0].schema
    expect(ids).toEqual(GAME_LIST.map((game) => game.id))
  })

  it('has game paths matching the app registry', () => {
    const registryPaths = [...read('src/games/registry.ts').matchAll(/path: '([^']+)'/g)].map(
      (match) => match[1],
    )
    expect(GAME_LIST.map((game) => game.path)).toEqual(registryPaths)
  })

  it('lists every public page in the sitemap', () => {
    const sitemap = read('public/sitemap.xml')
    const paths = [
      '',
      ...GAME_LIST.map((game) => game.path.slice(1)),
      'about',
      'contact',
      'privacy',
      'docs',
      'developers',
    ]
    paths.forEach((path) =>
      expect(sitemap).toContain(`<loc>https://nth-arcade.vercel.app/${path}</loc>`),
    )
  })

  it('has a valid MCP manifest and llms.txt guidance', () => {
    const manifest = JSON.parse(read('public/.well-known/mcp'))
    expect(manifest.remotes[0]).toEqual({
      type: 'streamable-http',
      url: 'https://nth-arcade.vercel.app/api/mcp',
    })
    expect(read('public/llms.txt')).toContain('## When to use this')
  })

  it('serves meaningful homepage content without JavaScript', () => {
    const html = read('index.html')
    const root = html.slice(html.indexOf('<div id="root">'), html.indexOf('<script type="module"'))
    const text = root.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    expect(text.length).toBeGreaterThan(500)
    expect(root).toContain('<h1>')
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('application/ld+json')
  })
})
