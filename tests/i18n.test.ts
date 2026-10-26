import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en.json'
import vi from '@/i18n/locales/vi.json'

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
