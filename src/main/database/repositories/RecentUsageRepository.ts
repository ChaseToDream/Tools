import { getDatabase } from '../database'
import type { RecentUsageRecord } from '../../../shared/types'

/**
 * 记录插件使用，已存在则 use_count+1 并更新 last_used_at
 * @param pluginName - 插件名称
 */
export function recordUsage(pluginName: string): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  const existing = db
    .prepare('SELECT use_count FROM recent_usage WHERE plugin_name = ?')
    .get(pluginName) as { use_count: number } | undefined

  if (existing) {
    db.prepare('UPDATE recent_usage SET use_count = ?, last_used_at = ? WHERE plugin_name = ?').run(
      existing.use_count + 1,
      now,
      pluginName
    )
  } else {
    db.prepare(
      'INSERT INTO recent_usage (plugin_name, use_count, last_used_at) VALUES (?, 1, ?)'
    ).run(pluginName, now)
  }
}

/**
 * 获取最近使用的插件列表
 * @param limit - 最大返回条数
 * @returns 按 last_used_at 降序排列的使用记录
 */
export function getRecent(limit: number): RecentUsageRecord[] {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM recent_usage ORDER BY last_used_at DESC LIMIT ?')
    .all(limit) as RecentUsageRecord[]
}

/**
 * 获取常用插件列表
 * @param limit - 最大返回条数
 * @returns 按 use_count 降序排列的使用记录
 */
export function getFrequent(limit: number): RecentUsageRecord[] {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM recent_usage ORDER BY use_count DESC LIMIT ?')
    .all(limit) as RecentUsageRecord[]
}
