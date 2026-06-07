import { describe, expect, it } from 'vitest'
import '@test/test-utils'
import * as PluginConfigRepo from './PluginConfigRepository'

describe('PluginConfigRepository', () => {
  it('set and get: 设置配置后能正确读取', () => {
    PluginConfigRepo.set('demo-tool', 'apiKey', '123456')
    expect(PluginConfigRepo.get('demo-tool', 'apiKey')).toBe('123456')
  })

  it('get non-existent: 返回 null', () => {
    expect(PluginConfigRepo.get('demo-tool', 'not_exist')).toBeNull()
  })

  it('getAll: 返回插件的所有配置', () => {
    PluginConfigRepo.set('demo-tool', 'key1', 'value1')
    PluginConfigRepo.set('demo-tool', 'key2', 'value2')
    const all = PluginConfigRepo.getAll('demo-tool')
    expect(all).toHaveLength(2)
  })

  it('delete: 删除后返回 null', () => {
    PluginConfigRepo.set('demo-tool', 'temp', 'value')
    PluginConfigRepo.deleteConfig('demo-tool', 'temp')
    expect(PluginConfigRepo.get('demo-tool', 'temp')).toBeNull()
  })

  it('update: 更新已有配置值', () => {
    PluginConfigRepo.set('demo-tool', 'setting', 'old')
    PluginConfigRepo.set('demo-tool', 'setting', 'new')
    expect(PluginConfigRepo.get('demo-tool', 'setting')).toBe('new')
  })
})
