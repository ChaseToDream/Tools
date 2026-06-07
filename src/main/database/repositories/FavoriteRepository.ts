import type { FavoriteRecord } from '../../../shared/types'
import { getDatabase } from '../database'

/**
 * 添加插件到收藏
 * @param pluginName - 插件名称
 */
export function add(pluginName: string): void {
  const db = getDatabase()
  db.prepare('INSERT OR IGNORE INTO favorites (plugin_name) VALUES (?)').run(pluginName)
}

/**
 * 取消插件收藏
 * @param pluginName - 插件名称
 */
export function remove(pluginName: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM favorites WHERE plugin_name = ?').run(pluginName)
}

/**
 * 判断插件是否已收藏
 * @param pluginName - 插件名称
 * @returns 是否已收藏
 */
export function isFavorite(pluginName: string): boolean {
  const db = getDatabase()
  const row = db.prepare('SELECT 1 FROM favorites WHERE plugin_name = ?').get(pluginName)
  return row !== undefined
}

/**
 * 获取所有收藏记录
 * @returns 收藏记录列表
 */
export function getAll(): FavoriteRecord[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM favorites ORDER BY created_at DESC').all() as FavoriteRecord[]
}
