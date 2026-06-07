import { Database, initAdapter } from '../../../test/sqlite-adapter'
import type { PluginRecord } from '../../../shared/types'
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { runMigrations } from '../migration'

/** 模拟 getDatabase 返回内存数据库实例 */
vi.mock('../database', () => ({
  getDatabase: () => globalThis.__testDb
}))

declare global {
  // eslint-disable-next-line no-var
  var __testDb: Database
}

/** 测试用内存数据库实例 */
let db: Database

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

/**
 * 初始化 sql.js WASM 引擎
 */
beforeAll(async () => {
  await initAdapter()
})

/**
 * 每个测试前创建内存数据库并执行迁移
 */
beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db as any)
  globalThis.__testDb = db
})

/**
 * 每个测试后关闭数据库连接
 */
afterEach(() => {
  db.close()
})

/** 动态导入，确保 mock 生效后再加载模块 */
const importRepo = () => import('./PluginRepository')

describe('PluginRepository', () => {
  it('insert and getByName: 插入插件后能按名称查询', async () => {
    const repo = await importRepo()
    const plugin = makePlugin()
    repo.insert(plugin)
    const result = repo.getByName('test-plugin')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('test-plugin')
    expect(result!.title).toBe('测试插件')
  })

  it('getByName non-existent: 返回 null', async () => {
    const repo = await importRepo()
    expect(repo.getByName('no-such-plugin')).toBeNull()
  })

  it('getAll: 返回所有插件', async () => {
    const repo = await importRepo()
    repo.insert(makePlugin({ name: 'plugin-a', title: 'A' }))
    repo.insert(makePlugin({ name: 'plugin-b', title: 'B' }))
    const all = repo.getAll()
    expect(all).toHaveLength(2)
  })

  it('getByCategory: 按分类过滤', async () => {
    const repo = await importRepo()
    repo.insert(makePlugin({ name: 'p1', category: '工具' }))
    repo.insert(makePlugin({ name: 'p2', category: '娱乐' }))
    const tools = repo.getByCategory('工具')
    expect(tools).toHaveLength(1)
    expect(tools[0].name).toBe('p1')
  })

  it('getEnabled: 只返回启用的插件', async () => {
    const repo = await importRepo()
    repo.insert(makePlugin({ name: 'p-on', enabled: 1 }))
    repo.insert(makePlugin({ name: 'p-off', enabled: 0 }))
    const enabled = repo.getEnabled()
    expect(enabled).toHaveLength(1)
    expect(enabled[0].name).toBe('p-on')
  })

  it('update: 更新插件信息', async () => {
    const repo = await importRepo()
    repo.insert(makePlugin())
    repo.update('test-plugin', { title: '新标题', version: '2.0.0' })
    const updated = repo.getByName('test-plugin')
    expect(updated!.title).toBe('新标题')
    expect(updated!.version).toBe('2.0.0')
  })

  it('delete: 删除后查询返回 null', async () => {
    const repo = await importRepo()
    repo.insert(makePlugin())
    repo.deletePlugin('test-plugin')
    expect(repo.getByName('test-plugin')).toBeNull()
  })
})
