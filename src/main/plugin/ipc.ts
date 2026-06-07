import { ipcMain, clipboard, Notification, shell, dialog, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { scanPlugins } from './scanner'
import {
  loadPlugin,
  enablePlugin,
  disablePlugin,
  unloadPlugin,
  reloadPlugin,
  getPluginEntryPath
} from './lifecycle'
import { installNpmPlugin, uninstallNpmPlugin } from './npm-installer'
import { getAllPlugins } from './registry'
import * as ConfigRepo from '../database/repositories/ConfigRepository'
import * as FavoriteRepo from '../database/repositories/FavoriteRepository'
import * as RecentRepo from '../database/repositories/RecentUsageRepository'
import * as PluginConfigRepo from '../database/repositories/PluginConfigRepository'
import { getDatabase } from '../database/database'

/**
 * 注册插件系统相关的 IPC handlers
 * 将插件生命周期操作桥接到渲染进程可调用的 IPC 通道
 */
export function registerPluginIpcHandlers(): void {
  /** 扫描所有插件目录 */
  ipcMain.handle('plugin:scan', () => scanPlugins())

  /** 加载指定插件 */
  ipcMain.handle('plugin:load', (_e, name: string) => loadPlugin(name))

  /** 启用插件 */
  ipcMain.handle('plugin:enable', (_e, name: string) => enablePlugin(name))

  /** 禁用插件 */
  ipcMain.handle('plugin:disable', (_e, name: string) => disablePlugin(name))

  /** 卸载插件 */
  ipcMain.handle('plugin:unload', (_e, name: string) => unloadPlugin(name))

  /** 重新加载插件 */
  ipcMain.handle('plugin:reload', (_e, name: string) => reloadPlugin(name))

  /** 安装 npm 插件 */
  ipcMain.handle('plugin:install', (_e, packageName: string) => installNpmPlugin(packageName))

  /** 卸载 npm 插件 */
  ipcMain.handle('plugin:uninstall', (_e, name: string) => uninstallNpmPlugin(name))

  /** 获取所有插件信息 */
  ipcMain.handle('plugin:getAll', () => getAllPlugins())

  /** 获取插件入口文件路径 */
  ipcMain.handle('plugin:getEntry', (_e, name: string) => getPluginEntryPath(name))

  /**
   * 读取插件入口文件内容并返回代码字符串
   * 渲染进程通过此通道获取插件源码，再用 new Function() 执行
   * @param name - 插件名称
   * @returns 插件入口文件内容字符串，失败返回 null
   */
  ipcMain.handle('plugin:readEntry', (_e, name: string): string | null => {
    const entryPath = getPluginEntryPath(name)
    if (!entryPath) return null
    try {
      return readFileSync(entryPath, 'utf-8')
    } catch {
      return null
    }
  })

  /** 读取系统剪贴板文本 */
  ipcMain.handle('clipboard:readText', () => clipboard.readText())

  /**
   * 写入文本到系统剪贴板
   * @param text - 要写入的文本
   */
  ipcMain.handle('clipboard:writeText', (_e, text: string) => clipboard.writeText(text))

  /**
   * 显示系统通知
   * @param title - 通知标题
   * @param body - 通知内容
   */
  ipcMain.handle('notification:show', (_e, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  /**
   * 在系统默认浏览器中打开外部链接
   * @param url - 要打开的 URL
   */
  ipcMain.handle('shell:openExternal', (_e, url: string) => shell.openExternal(url))

  // ---- 文件对话框 ----
  ipcMain.handle(
    'dialog:openFile',
    async (_e, options?: { filters?: { name: string; extensions: string[] }[] }) => {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return null
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: options?.filters
      })
      return result.canceled ? null : result.filePaths[0]
    }
  )

  ipcMain.handle('dialog:saveFile', async (_e, options?: { defaultPath?: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showSaveDialog(win, {
      defaultPath: options?.defaultPath
    })
    return result.canceled ? null : result.filePath
  })

  // ---- 文件读写 ----
  ipcMain.handle('fs:readFile', (_e, path: string): string | null => {
    try {
      return readFileSync(path, 'utf-8')
    } catch {
      return null
    }
  })

  ipcMain.handle('fs:writeFile', (_e, path: string, content: string): boolean => {
    try {
      writeFileSync(path, content, 'utf-8')
      return true
    } catch {
      return false
    }
  })

  // ---- HTTP 请求 ----
  ipcMain.handle(
    'http:fetch',
    async (
      _e,
      url: string,
      options?: { method?: string; headers?: Record<string, string>; body?: string }
    ) => {
      try {
        const resp = await fetch(url, {
          method: options?.method ?? 'GET',
          headers: options?.headers,
          body: options?.body
        })
        const data = await resp.json().catch(() => null)
        return { ok: resp.ok, status: resp.status, data }
      } catch {
        return { ok: false, status: 0, data: null }
      }
    }
  )

  // ---- 窗口置顶 ----
  ipcMain.handle('window:toggleTop', (_e, pinned?: boolean) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return false
    const newState = pinned ?? !win.isAlwaysOnTop()
    win.setAlwaysOnTop(newState)
    return newState
  })

  // ---- 数据导入导出 ----
  ipcMain.handle('data:export', () => {
    const favorites = FavoriteRepo.getAll().map((f) => f.plugin_name)
    const configRows = ConfigRepo.getAll()
    const recentRecords = RecentRepo.getRecent(100)
    const usageStats: Record<string, { count: number; lastUsed: string }> = {}
    for (const r of recentRecords) {
      usageStats[r.plugin_name] = { count: r.use_count, lastUsed: r.last_used_at }
    }

    // 收集所有插件的配置
    const pluginConfig: Record<string, Record<string, string>> = {}
    for (const fav of favorites) {
      const configs = PluginConfigRepo.getAll(fav)
      if (configs.length > 0) {
        pluginConfig[fav] = {}
        for (const c of configs) {
          pluginConfig[fav][c.config_key] = c.config_value
        }
      }
    }
    // 也收集有使用记录但未收藏的插件配置
    for (const name of Object.keys(usageStats)) {
      if (!pluginConfig[name]) {
        const configs = PluginConfigRepo.getAll(name)
        if (configs.length > 0) {
          pluginConfig[name] = {}
          for (const c of configs) {
            pluginConfig[name][c.config_key] = c.config_value
          }
        }
      }
    }

    return {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      favorites,
      config: configRows,
      pluginConfig,
      usageStats
    }
  })

  ipcMain.handle('data:import', (_e, data: any, mode: 'merge' | 'overwrite') => {
    try {
      if (mode === 'overwrite') {
        // 清空现有数据
        const db = getDatabase()
        db.exec('DELETE FROM favorites')
        db.exec('DELETE FROM config')
        db.exec('DELETE FROM recent_usage')
        db.exec('DELETE FROM plugin_config')
      }

      // 导入收藏
      if (data.favorites && Array.isArray(data.favorites)) {
        for (const name of data.favorites) {
          FavoriteRepo.add(name)
        }
      }

      // 导入配置
      if (data.config && typeof data.config === 'object') {
        for (const [key, value] of Object.entries(data.config)) {
          ConfigRepo.set(key, String(value))
        }
      }

      // 导入插件配置
      if (data.pluginConfig && typeof data.pluginConfig === 'object') {
        for (const [pluginName, configs] of Object.entries(data.pluginConfig)) {
          if (configs && typeof configs === 'object') {
            for (const [key, value] of Object.entries(configs as Record<string, string>)) {
              PluginConfigRepo.set(pluginName, key, String(value))
            }
          }
        }
      }

      // 导入使用统计
      if (data.usageStats && typeof data.usageStats === 'object') {
        const db = getDatabase()
        for (const [pluginName, stats] of Object.entries(data.usageStats)) {
          const s = stats as { count: number; lastUsed: string }
          db.prepare(
            'INSERT INTO recent_usage (plugin_name, use_count, last_used_at) VALUES (?, ?, ?) ON CONFLICT(plugin_name) DO UPDATE SET use_count = ?, last_used_at = ?'
          ).run(pluginName, s.count, s.lastUsed, s.count, s.lastUsed)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
