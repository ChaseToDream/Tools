import { contextBridge, ipcRenderer } from 'electron'
import type { DbApi, PluginSystemApi, SystemApi } from '../shared/types'

/**
 * 通过 contextBridge 安全地暴露数据库 API 给渲染进程
 * 渲染进程通过 window.db.config / window.db.plugin / window.db.favorite 访问
 */
const db: DbApi = {
  config: {
    get: (key: string) => ipcRenderer.invoke('config:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('config:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('config:delete', key),
    getAll: () => ipcRenderer.invoke('config:getAll')
  } as DbApi['config'],
  plugin: {
    insert: (plugin) => ipcRenderer.invoke('plugin:insert', plugin),
    update: (name, data) => ipcRenderer.invoke('plugin:update', name, data),
    delete: (name) => ipcRenderer.invoke('plugin:delete', name),
    getByName: (name) => ipcRenderer.invoke('plugin:getByName', name),
    getAll: () => ipcRenderer.invoke('plugin:getAll'),
    getByCategory: (category) => ipcRenderer.invoke('plugin:getByCategory', category),
    getEnabled: () => ipcRenderer.invoke('plugin:getEnabled')
  } as DbApi['plugin'],
  favorite: {
    add: (pluginName) => ipcRenderer.invoke('favorite:add', pluginName),
    remove: (pluginName) => ipcRenderer.invoke('favorite:remove', pluginName),
    isFavorite: (pluginName) => ipcRenderer.invoke('favorite:isFavorite', pluginName),
    getAll: () => ipcRenderer.invoke('favorite:getAll')
  } as DbApi['favorite']
}

/**
 * 插件系统 API，暴露给渲染进程使用
 * 渲染进程通过 window.pluginSystem.scan() / .load() 等访问
 */
const pluginSystem: PluginSystemApi = {
  scan: () => ipcRenderer.invoke('plugin:scan'),
  load: (name) => ipcRenderer.invoke('plugin:load', name),
  enable: (name) => ipcRenderer.invoke('plugin:enable', name),
  disable: (name) => ipcRenderer.invoke('plugin:disable', name),
  unload: (name) => ipcRenderer.invoke('plugin:unload', name),
  reload: (name) => ipcRenderer.invoke('plugin:reload', name),
  install: (packageName) => ipcRenderer.invoke('plugin:install', packageName),
  uninstall: (name) => ipcRenderer.invoke('plugin:uninstall', name),
  getAll: () => ipcRenderer.invoke('plugin:getAll'),
  getEntry: (name) => ipcRenderer.invoke('plugin:getEntry', name),
  readEntry: (name) => ipcRenderer.invoke('plugin:readEntry', name)
}

/**
 * 系统能力 API，暴露给渲染进程使用
 * 渲染进程通过 window.system.clipboard / .notification / .shell 访问
 */
const system: SystemApi = {
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:readText'),
    writeText: (text: string) => ipcRenderer.invoke('clipboard:writeText', text)
  },
  notification: {
    show: (title: string, body: string) => ipcRenderer.invoke('notification:show', title, body)
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  }
}

contextBridge.exposeInMainWorld('db', db)
contextBridge.exposeInMainWorld('pluginSystem', pluginSystem)
contextBridge.exposeInMainWorld('system', system)
