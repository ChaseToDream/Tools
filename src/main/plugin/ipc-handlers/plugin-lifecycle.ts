import { ipcMain } from 'electron'
import { readFileSync } from 'fs'
import { scanPlugins } from '../scanner'
import {
  loadPlugin,
  enablePlugin,
  disablePlugin,
  unloadPlugin,
  reloadPlugin,
  getPluginEntryPath
} from '../lifecycle'
import { installNpmPlugin, uninstallNpmPlugin } from '../npm-installer'
import { getAllPlugins } from '../registry'

/**
 * 注册插件生命周期相关的 IPC handlers
 * 包括插件扫描、加载、启用、禁用、卸载、安装等操作
 */
export function registerPluginLifecycleIpcHandlers(): void {
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
}
