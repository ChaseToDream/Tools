import { describe, expect, it } from 'vitest'
import '@test/test-utils'
import * as RecentRepo from './RecentUsageRepository'

describe('RecentUsageRepository', () => {
  it('recordUsage: 记录使用', () => {
    RecentRepo.recordUsage('demo-tool')
    const recent = RecentRepo.getRecent(10)
    expect(recent).toHaveLength(1)
    expect(recent[0].plugin_name).toBe('demo-tool')
    expect(recent[0].use_count).toBe(1)
  })

  it('recordUsage twice: 使用次数累加', () => {
    RecentRepo.recordUsage('demo-tool')
    RecentRepo.recordUsage('demo-tool')
    const recent = RecentRepo.getRecent(10)
    expect(recent[0].use_count).toBe(2)
  })

  it('getRecent: 按时间降序', async () => {
    RecentRepo.recordUsage('plugin-a')
    await new Promise((r) => setTimeout(r, 10))
    RecentRepo.recordUsage('plugin-b')
    const recent = RecentRepo.getRecent(10)
    expect(recent[0].plugin_name).toBe('plugin-b')
  })

  it('getFrequent: 按次数降序', () => {
    RecentRepo.recordUsage('plugin-a')
    RecentRepo.recordUsage('plugin-b')
    RecentRepo.recordUsage('plugin-b')
    const frequent = RecentRepo.getFrequent(10)
    expect(frequent[0].plugin_name).toBe('plugin-b')
    expect(frequent[0].use_count).toBe(2)
  })
})
