import { describe, expect, it } from 'vitest'
import gamesHandler from '../api/games/index'
import gameHandler from '../api/games/[id]'
import { run } from './index.js'

const fetchImpl = ((input: string) => {
  const request = new Request(input)
  const { pathname } = new URL(request.url)
  return Promise.resolve(
    pathname === '/api/games' ? gamesHandler.fetch(request) : gameHandler.fetch(request),
  )
}) as unknown as typeof fetch

const runCli = async (args: string[]) => {
  const lines: string[] = []
  const code = await run(args, {
    fetchImpl,
    log: (line: string) => lines.push(line),
    baseUrl: 'http://x',
  })
  return { code, output: lines.join('\n') }
}

describe('cli', () => {
  it('lists games', async () => {
    const { code, output } = await runCli(['list'])
    expect(code).toBe(0)
    expect(output).toContain('Tetris (tetris)')
  })

  it('gets one game as json', async () => {
    const { code, output } = await runCli(['get', 'snake', '--json'])
    expect(code).toBe(0)
    expect(JSON.parse(output).id).toBe('snake')
  })

  it('reports API errors with a non-zero code', async () => {
    const { code, output } = await runCli(['get', 'nope'])
    expect(code).toBe(1)
    expect(output).toContain('No game with id "nope"')
  })

  it('prints usage for unknown commands', async () => {
    const { code, output } = await runCli(['bogus'])
    expect(code).toBe(1)
    expect(output).toContain('Usage')
  })
})
