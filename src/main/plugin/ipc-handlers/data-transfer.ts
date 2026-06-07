import { ipcMain } from 'electron'
import * as ConfigRepo from '../../database/repositories/ConfigRepository'
import * as FavoriteRepo from '../../database/repositories/FavoriteRepository'
import * as RecentRepo from '../../database/repositories/RecentUsageRepository'
import * as PluginConfigRepo from '../../database/repositories/PluginConfigRepository'
import { getDatabase } from '../../database/database'

/**
 * 收集所有插件的配置数据
 * 遍历所有有收藏或使用记录的插件，收集其配置项
 * @returns 插件配置映射（插件名 -> 配置键值对）
 */
function collectPluginConfigs(): Record<string, Record<string, string>> {
  const favorites = FavoriteRepo.getAll().map((f) => f.plugin_name)
  const recentRecords = RecentRepo.getRecent(100)

  const pluginNames = new Set<string>([...favorites, ...recentRecords.map((r) => r.plugin_name)])
  const result: Record<string, Record<string, string>> = {}

  for (const name of pluginNames) {
    const configs = PluginConfigRepo.getAll(name)
    if (configs.length > 0) {
      result[name] = {}
      for (const c of configs) {
        result[name][c.config_key] = c.config_value
      }
    }
  }

  return result
}

/**
 * 注册数据导入导出相关的 IPC handlers
 * 支持将收藏、配置、使用记录导出为 JSON，以及从 JSON 恢复
 */
export function registerDataTransferIpcHandlers(): void {
  /**
   * 导出应用数据为 JSON 格式
   * @returns 包含版本、收藏、配置、使用统计的数据对象
   */
  ipcMain.handle('data:export', () => {
    const favorites = FavoriteRepo.getAll().map((f) => f.plugin_name)
    const configRows = ConfigRepo.getAll()
    const recentRecords = RecentRepo.getRecent(100)

    const usageStats: Record<string, { count: number; lastUsed: string }> = {}
    for (const r of recentRecords) {
      usageStats[r.plugin_name] = { count: r.use_count, lastUsed: r.last_used_at }
    }

    return {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      favorites,
      config: configRows,
      pluginConfig: collectPluginConfigs(),
      usageStats
    }
  })

  /**
   * 导入应用数据
   * @param data - 要导入的数据对象
   * @param mode - 导入模式：merge 合并 / overwrite 覆盖
   * @returns 导入结果
   */
  ipcMain.handle('data:import', (_e, data: unknown, mode: 'merge' | 'overwrite') => {
    try {
      const importData = data as {
        favorites?: string[]
        config?: Record<string, string>
        pluginConfig?: Record<string, Record<string, string>>
        usageStats?: Record<string, { count: number; lastUsed: string }>
      }

      if (mode === 'overwrite') {
        const db = getDatabase()
        db.exec('DELETE FROM favorites')
        db.exec('DELETE FROM config')
        db.exec('DELETE FROM recent_usage')
        db.exec('DELETE FROM plugin_config')
      }

      // 导入收藏
      if (importData.favorites && Array.isArray(importData.favorites)) {
        for (const name of importData.favorites) {
          FavoriteRepo.add(name)
        }
      }

      // 导入配置
      if (importData.config && typeof importData.config === 'object') {
        for (const [key, value] of Object.entries(importData.config)) {
          ConfigRepo.set(key, String(value))
        }
      }

      // 导入插件配置
      if (importData.pluginConfig && typeof importData.pluginConfig === 'object') {
        for (const [pluginName, configs] of Object.entries(importData.pluginConfig)) {
          if (configs && typeof configs === 'object') {
            for (const [key, value] of Object.entries(configs as Record<string, string>)) {
              PluginConfigRepo.set(pluginName, key, String(value))
            }
          }
        }
      }

      // 导入使用统计
      if (importData.usageStats && typeof importData.usageStats === 'object') {
        const db = getDatabase()
        const stmt = db.prepare(
          'INSERT INTO recent_usage (plugin_name, use_count, last_used_at) VALUES (?, ?, ?) ON CONFLICT(plugin_name) DO UPDATE SET use_count = ?, last_used_at = ?'
        )
        for (const [pluginName, stats] of Object.entries(importData.usageStats)) {
          const s = stats as { count: number; lastUsed: string }
          stmt.run(pluginName, s.count, s.lastUsed, s.count, s.lastUsed)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
