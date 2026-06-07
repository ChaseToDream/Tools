import { getDatabase } from '../database'

/**
 * 根据键名获取配置值
 * @param key - 配置键名
 * @returns 配置值，不存在则返回 null
 */
export function get(key: string): string | null {
  const db = getDatabase()
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row ? row.value : null
}

/**
 * 设置配置项（键存在则更新，不存在则插入）
 * @param key - 配置键名
 * @param value - 配置值
 */
export function set(key: string, value: string): void {
  const db = getDatabase()
  db.prepare('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP').run(key, value)
}

/**
 * 删除指定配置项
 * @param key - 配置键名
 */
export function deleteConfig(key: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM config WHERE key = ?').run(key)
}

/**
 * 获取所有配置项
 * @returns 键值对对象
 */
export function getAll(): Record<string, string> {
  const db = getDatabase()
  const rows = db.prepare('SELECT key, value FROM config').all() as { key: string; value: string }[]
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}
