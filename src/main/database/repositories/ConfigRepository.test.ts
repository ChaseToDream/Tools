import { Database, initAdapter } from '../../../test/sqlite-adapter'
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
const importRepo = () => import('./ConfigRepository')

describe('ConfigRepository', () => {
  it('set and get: 设置配置后能正确读取', async () => {
    const repo = await importRepo()
    repo.set('theme', 'dark')
    expect(repo.get('theme')).toBe('dark')
  })

  it('get non-existent key: 返回 null', async () => {
    const repo = await importRepo()
    expect(repo.get('not_exist')).toBeNull()
  })

  it('delete: 删除后 get 返回 null', async () => {
    const repo = await importRepo()
    repo.set('lang', 'zh-CN')
    repo.deleteConfig('lang')
    expect(repo.get('lang')).toBeNull()
  })

  it('getAll: 返回所有配置', async () => {
    const repo = await importRepo()
    repo.set('theme', 'dark')
    repo.set('lang', 'zh-CN')
    const all = repo.getAll()
    expect(all).toEqual({ theme: 'dark', lang: 'zh-CN' })
  })

  it('update existing key: set 同名 key 会更新值', async () => {
    const repo = await importRepo()
    repo.set('theme', 'dark')
    repo.set('theme', 'light')
    expect(repo.get('theme')).toBe('light')
  })
})
