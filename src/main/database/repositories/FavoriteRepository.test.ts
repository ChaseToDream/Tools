import { Database, initAdapter } from '../../../test/sqlite-adapter'
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { runMigrations } from '../migration'

/** 模拟 getDatabase 返回内存数据库实例 */
vi.mock('../database', () => ({
  getDatabase: () => globalThis.__testDb
}))

declare global {
  var __testDb: Database
}

/** 测试用内存数据库实例 */
let db: Database

/**
 * 插入一条插件记录，供收藏测试使用
 * @param name - 插件名称
 */
function insertPlugin(name: string): void {
  db.prepare(
    `INSERT INTO plugins (name, version, title, description, category, sub_category, icon, main, source, enabled)
     VALUES (?, '1.0.0', ?, '', '工具', '', '', 'index.js', 'local', 1)`
  ).run(name, name)
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
const importRepo = () => import('./FavoriteRepository')

describe('FavoriteRepository', () => {
  it('add and isFavorite: 添加收藏后查询返回 true', async () => {
    const repo = await importRepo()
    insertPlugin('my-plugin')
    repo.add('my-plugin')
    expect(repo.isFavorite('my-plugin')).toBe(true)
  })

  it('isFavorite non-existent: 返回 false', async () => {
    const repo = await importRepo()
    expect(repo.isFavorite('no-such-plugin')).toBe(false)
  })

  it('remove: 移除后 isFavorite 返回 false', async () => {
    const repo = await importRepo()
    insertPlugin('my-plugin')
    repo.add('my-plugin')
    repo.remove('my-plugin')
    expect(repo.isFavorite('my-plugin')).toBe(false)
  })

  it('getAll: 返回所有收藏', async () => {
    const repo = await importRepo()
    insertPlugin('p1')
    insertPlugin('p2')
    repo.add('p1')
    repo.add('p2')
    const all = repo.getAll()
    expect(all).toHaveLength(2)
    const names = all.map((r) => r.plugin_name)
    expect(names).toContain('p1')
    expect(names).toContain('p2')
  })
})
