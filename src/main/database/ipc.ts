import { ipcMain } from 'electron'
import * as ConfigRepo from './repositories/ConfigRepository'
import * as PluginRepo from './repositories/PluginRepository'
import * as FavoriteRepo from './repositories/FavoriteRepository'

/**
 * 注册所有数据库相关的 IPC handlers
 * 将 Repository 方法桥接到渲染进程可调用的 IPC 通道
 */
export function registerIpcHandlers(): void {
  // ---- config 命名空间 ----
  ipcMain.handle('config:get', (_e, key: string) => ConfigRepo.get(key))
  ipcMain.handle('config:set', (_e, key: string, value: string) => ConfigRepo.set(key, value))
  ipcMain.handle('config:delete', (_e, key: string) => ConfigRepo.deleteConfig(key))
  ipcMain.handle('config:getAll', () => ConfigRepo.getAll())

  // ---- plugin 命名空间 ----
  ipcMain.handle('plugin:insert', (_e, plugin) => PluginRepo.insert(plugin))
  ipcMain.handle('plugin:update', (_e, name: string, data) => PluginRepo.update(name, data))
  ipcMain.handle('plugin:delete', (_e, name: string) => PluginRepo.deletePlugin(name))
  ipcMain.handle('plugin:getByName', (_e, name: string) => PluginRepo.getByName(name))
  ipcMain.handle('plugin:getAll', () => PluginRepo.getAll())
  ipcMain.handle('plugin:getByCategory', (_e, category: string) => PluginRepo.getByCategory(category))
  ipcMain.handle('plugin:getEnabled', () => PluginRepo.getEnabled())

  // ---- favorite 命名空间 ----
  ipcMain.handle('favorite:add', (_e, pluginName: string) => FavoriteRepo.add(pluginName))
  ipcMain.handle('favorite:remove', (_e, pluginName: string) => FavoriteRepo.remove(pluginName))
  ipcMain.handle('favorite:isFavorite', (_e, pluginName: string) => FavoriteRepo.isFavorite(pluginName))
  ipcMain.handle('favorite:getAll', () => FavoriteRepo.getAll())
}
