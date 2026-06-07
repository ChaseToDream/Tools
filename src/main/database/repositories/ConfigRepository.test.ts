import { describe, expect, it } from 'vitest'
import '@test/test-utils'
import * as ConfigRepo from './ConfigRepository'

describe('ConfigRepository', () => {
  it('set and get: 设置配置后能正确读取', () => {
    ConfigRepo.set('theme', 'dark')
    expect(ConfigRepo.get('theme')).toBe('dark')
  })

  it('get non-existent key: 返回 null', () => {
    expect(ConfigRepo.get('not_exist')).toBeNull()
  })

  it('delete: 删除后 get 返回 null', () => {
    ConfigRepo.set('lang', 'zh-CN')
    ConfigRepo.deleteConfig('lang')
    expect(ConfigRepo.get('lang')).toBeNull()
  })

  it('getAll: 返回所有配置', () => {
    ConfigRepo.set('theme', 'dark')
    ConfigRepo.set('lang', 'zh-CN')
    const all = ConfigRepo.getAll()
    expect(all).toEqual({ theme: 'dark', lang: 'zh-CN' })
  })

  it('update existing key: set 同名 key 会更新值', () => {
    ConfigRepo.set('theme', 'dark')
    ConfigRepo.set('theme', 'light')
    expect(ConfigRepo.get('theme')).toBe('light')
  })
})
