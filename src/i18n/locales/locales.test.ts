import { describe, expect, it } from 'vitest'
import en from './en.json'
import vi from './vi.json'

function keyPaths(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keyPaths(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('locales', () => {
  it('vi has exactly the same keys as en', () => {
    expect(keyPaths(vi).sort()).toEqual(keyPaths(en).sort())
  })
})
