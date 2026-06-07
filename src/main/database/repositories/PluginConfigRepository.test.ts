import { Database, initAdapter } from '../../../test/sqlite-adapter'
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { runMigrations } from '../migration'

vi.mock('../database', () => ({
  getDatabase: () => globalThis.__testDb
}))

declare global {
  var __testDb: Database
}

let db: Database

beforeAll(async () => {
  await initAdapter()
})

beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db as any)
  globalThis.__testDb = db
})

afterEach(() => {
  db.close()
})

const importRepo = () => import('./PluginConfigRepository')

describe('PluginConfigRepository', () => {
  it('set and get: 设置配置后能正确读取', async () => {
    const repo = await importRepo()
    repo.set('test-plugin', 'apiKey', 'abc123')
    expect(repo.get('test-plugin', 'apiKey')).toBe('abc123')
  })

  it('get non-existent key: 返回 null', async () => {
    const repo = await importRepo()
    expect(repo.get('test-plugin', 'missing')).toBeNull()
  })

  it('update existing key: set 同名 key 会更新值', async () => {
    const repo = await importRepo()
    repo.set('test-plugin', 'timeout', '5000')
    repo.set('test-plugin', 'timeout', '10000')
    expect(repo.get('test-plugin', 'timeout')).toBe('10000')
  })

  it('getAll: 返回插件的所有配置', async () => {
    const repo = await importRepo()
    repo.set('test-plugin', 'key1', 'val1')
    repo.set('test-plugin', 'key2', 'val2')
    const all = repo.getAll('test-plugin')
    expect(all).toHaveLength(2)
  })

  it('deleteConfig: 删除后 get 返回 null', async () => {
    const repo = await importRepo()
    repo.set('test-plugin', 'apiKey', 'abc')
    repo.deleteConfig('test-plugin', 'apiKey')
    expect(repo.get('test-plugin', 'apiKey')).toBeNull()
  })
})
