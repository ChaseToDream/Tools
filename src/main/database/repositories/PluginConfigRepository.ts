import { getDatabase } from '../database'
import type { PluginConfigRecord } from '../../../shared/types'

/**
 * 读取插件配置值
 * @param pluginName - 插件名称
 * @param key - 配置键名
 * @returns 配置值字符串，不存在返回 null
 */
export function get(pluginName: string, key: string): string | null {
  const db = getDatabase()
  const row = db
    .prepare('SELECT config_value FROM plugin_config WHERE plugin_name = ? AND config_key = ?')
    .get(pluginName, key) as { config_value: string } | undefined
  return row?.config_value ?? null
}

/**
 * 写入插件配置值（已存在则更新）
 * @param pluginName - 插件名称
 * @param key - 配置键名
 * @param value - 配置值
 */
export function set(pluginName: string, key: string, value: string): void {
  const db = getDatabase()
  db.prepare(
    'INSERT INTO plugin_config (plugin_name, config_key, config_value) VALUES (?, ?, ?) ON CONFLICT(plugin_name, config_key) DO UPDATE SET config_value = excluded.config_value'
  ).run(pluginName, key, value)
}

/**
 * 获取插件的所有配置
 * @param pluginName - 插件名称
 * @returns 配置记录列表
 */
export function getAll(pluginName: string): PluginConfigRecord[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM plugin_config WHERE plugin_name = ?').all(pluginName) as PluginConfigRecord[]
}

/**
 * 删除插件的某个配置项
 * @param pluginName - 插件名称
 * @param key - 配置键名
 */
export function deleteConfig(pluginName: string, key: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM plugin_config WHERE plugin_name = ? AND config_key = ?').run(pluginName, key)
}
