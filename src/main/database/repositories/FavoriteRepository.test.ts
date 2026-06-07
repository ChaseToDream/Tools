import { describe, expect, it } from 'vitest'
import '@test/test-utils'
import * as FavoriteRepo from './FavoriteRepository'
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

describe('FavoriteRepository', () => {
  it('add and isFavorite: 添加收藏后能正确判断', () => {
    PluginRepo.insert(makePlugin({ name: 'demo-tool' }))
    FavoriteRepo.add('demo-tool')
    expect(FavoriteRepo.isFavorite('demo-tool')).toBe(true)
  })

  it('remove: 取消收藏后返回 false', () => {
    PluginRepo.insert(makePlugin({ name: 'demo-tool' }))
    FavoriteRepo.add('demo-tool')
    FavoriteRepo.remove('demo-tool')
    expect(FavoriteRepo.isFavorite('demo-tool')).toBe(false)
  })

  it('getAll: 返回所有收藏记录', () => {
    PluginRepo.insert(makePlugin({ name: 'plugin-a' }))
    PluginRepo.insert(makePlugin({ name: 'plugin-b' }))
    FavoriteRepo.add('plugin-a')
    FavoriteRepo.add('plugin-b')
    const all = FavoriteRepo.getAll()
    expect(all).toHaveLength(2)
  })

  it('重复添加不报错', () => {
    PluginRepo.insert(makePlugin({ name: 'demo-tool' }))
    FavoriteRepo.add('demo-tool')
    FavoriteRepo.add('demo-tool')
    expect(FavoriteRepo.getAll()).toHaveLength(1)
  })
})
