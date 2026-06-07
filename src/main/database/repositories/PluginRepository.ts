import type { PluginRecord } from '../../../shared/types'
import { getDatabase } from '../database'

/**
 * 插入一条插件记录
 * @param plugin - 插件记录对象
 */
export function insert(plugin: PluginRecord): void {
  const db = getDatabase()
  db.prepare(`INSERT INTO plugins (name, version, title, description, category, sub_category, icon, main, source, enabled)
    VALUES (@name, @version, @title, @description, @category, @sub_category, @icon, @main, @source, @enabled)`).run(plugin)
}

/**
 * 更新指定插件的字段
 * @param name - 插件名称（主键）
 * @param data - 需要更新的字段
 */
export function update(name: string, data: Partial<PluginRecord>): void {
  const db = getDatabase()
  const fields = Object.keys(data) as (keyof PluginRecord)[]
  if (fields.length === 0) return

  const setClause = fields.map((f) => `${f} = @${f}`).join(', ')
  const params = { ...data, name }
  db.prepare(`UPDATE plugins SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE name = @name`).run(params)
}

/**
 * 删除指定插件记录
 * @param name - 插件名称（主键）
 */
export function deletePlugin(name: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM plugins WHERE name = ?').run(name)
}

/**
 * 根据名称查询插件
 * @param name - 插件名称
 * @returns 插件记录，不存在则返回 null
 */
export function getByName(name: string): PluginRecord | null {
  const db = getDatabase()
  return (db.prepare('SELECT * FROM plugins WHERE name = ?').get(name) as PluginRecord | undefined) ?? null
}

/**
 * 获取所有插件记录
 * @returns 插件记录列表
 */
export function getAll(): PluginRecord[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM plugins ORDER BY installed_at DESC').all() as PluginRecord[]
}

/**
 * 根据分类查询插件
 * @param category - 分类名称
 * @returns 该分类下的插件列表
 */
export function getByCategory(category: string): PluginRecord[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM plugins WHERE category = ? ORDER BY installed_at DESC').all(category) as PluginRecord[]
}

/**
 * 获取所有已启用的插件
 * @returns 已启用的插件列表
 */
export function getEnabled(): PluginRecord[] {
  const db = getDatabase()
  return db.prepare('SELECT * FROM plugins WHERE enabled = 1 ORDER BY installed_at DESC').all() as PluginRecord[]
}
