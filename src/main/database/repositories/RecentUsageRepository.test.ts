import { Database, initAdapter } from '../../../test/sqlite-adapter'
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { runMigrations } from '../migration'

vi.mock('../database', () => ({
  getDatabase: () => globalThis.__testDb
}))

declare global {
  // eslint-disable-next-line no-var
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

const importRepo = () => import('./RecentUsageRepository')

describe('RecentUsageRepository', () => {
  it('recordUsage: 首次记录应插入新行', async () => {
    const repo = await importRepo()
    repo.recordUsage('test-plugin')
    const result = repo.getRecent(10)
    expect(result).toHaveLength(1)
    expect(result[0].plugin_name).toBe('test-plugin')
    expect(result[0].use_count).toBe(1)
  })

  it('recordUsage: 重复记录应递增 use_count', async () => {
    const repo = await importRepo()
    repo.recordUsage('test-plugin')
    repo.recordUsage('test-plugin')
    const result = repo.getRecent(10)
    expect(result[0].use_count).toBe(2)
  })

  it('getRecent: 按 last_used_at 降序排列', async () => {
    vi.useFakeTimers()
    const repo = await importRepo()
    repo.recordUsage('plugin-a')
    vi.advanceTimersByTime(1000)
    repo.recordUsage('plugin-b')
    vi.useRealTimers()
    const result = repo.getRecent(10)
    expect(result[0].plugin_name).toBe('plugin-b')
  })

  it('getFrequent: 按 use_count 降序排列', async () => {
    const repo = await importRepo()
    repo.recordUsage('plugin-a')
    repo.recordUsage('plugin-a')
    repo.recordUsage('plugin-b')
    const result = repo.getFrequent(10)
    expect(result[0].plugin_name).toBe('plugin-a')
  })

  it('getRecent/getFrequent: 应限制返回条数', async () => {
    const repo = await importRepo()
    for (let i = 0; i < 25; i++) {
      repo.recordUsage(`plugin-${i}`)
    }
    expect(repo.getRecent(20)).toHaveLength(20)
    expect(repo.getFrequent(10)).toHaveLength(10)
  })
})
