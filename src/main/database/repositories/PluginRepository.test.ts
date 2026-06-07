import { describe, expect, it } from 'vitest'
import '@test/test-utils'
import * as PluginRepo from './PluginRepository'
import type { PluginRecord } from '../../../shared/types'

/**
 * 构造一个最小可用的 PluginRecord 对象
 * @param overrides - 需要覆盖的字段
 * @returns 完整的插件记录
 */
function makePlugin(overrides: Partial<PluginRecord> = {}): PluginRecord {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    title: '测试插件',
    description: '用于测试',
    category: '工具',
    sub_category: '',
    icon: '',
    main: 'index.js',
    source: 'local',
    enabled: 1,
    installed_at: '',
    updated_at: '',
    ...overrides
  }
}

describe('PluginRepository', () => {
  it('insert and getByName: 插入插件后能按名称查询', () => {
    const plugin = makePlugin()
    PluginRepo.insert(plugin)
    const result = PluginRepo.getByName('test-plugin')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('test-plugin')
    expect(result!.title).toBe('测试插件')
  })

  it('getByName non-existent: 返回 null', () => {
    expect(PluginRepo.getByName('no-such-plugin')).toBeNull()
  })

  it('getAll: 返回所有插件', () => {
    PluginRepo.insert(makePlugin({ name: 'plugin-a', title: 'A' }))
    PluginRepo.insert(makePlugin({ name: 'plugin-b', title: 'B' }))
    const all = PluginRepo.getAll()
    expect(all).toHaveLength(2)
  })

  it('getByCategory: 按分类过滤', () => {
    PluginRepo.insert(makePlugin({ name: 'p1', category: '工具' }))
    PluginRepo.insert(makePlugin({ name: 'p2', category: '娱乐' }))
    const tools = PluginRepo.getByCategory('工具')
    expect(tools).toHaveLength(1)
    expect(tools[0].name).toBe('p1')
  })

  it('getEnabled: 只返回启用的插件', () => {
    PluginRepo.insert(makePlugin({ name: 'p-on', enabled: 1 }))
    PluginRepo.insert(makePlugin({ name: 'p-off', enabled: 0 }))
    const enabled = PluginRepo.getEnabled()
    expect(enabled).toHaveLength(1)
    expect(enabled[0].name).toBe('p-on')
  })

  it('update: 更新插件信息', () => {
    PluginRepo.insert(makePlugin())
    PluginRepo.update('test-plugin', { title: '新标题', version: '2.0.0' })
    const updated = PluginRepo.getByName('test-plugin')
    expect(updated!.title).toBe('新标题')
    expect(updated!.version).toBe('2.0.0')
  })

  it('delete: 删除后查询返回 null', () => {
    PluginRepo.insert(makePlugin())
    PluginRepo.deletePlugin('test-plugin')
    expect(PluginRepo.getByName('test-plugin')).toBeNull()
  })
})
