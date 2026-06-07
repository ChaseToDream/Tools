import { contextBridge, ipcRenderer } from 'electron'
import type { SystemApi } from '../shared/types'

/**
 * 通过 contextBridge 安全地暴露数据库 API 给渲染进程
 * 渲染进程通过 window.db.config / window.db.plugin / window.db.favorite 访问
 */
const db = {
  config: {
    get: (key: string) => ipcRenderer.invoke('config:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('config:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('config:delete', key),
    getAll: () => ipcRenderer.invoke('config:getAll')
  },
  plugin: {
    insert: (plugin: unknown) => ipcRenderer.invoke('plugin:insert', plugin),
    update: (name: string, data: unknown) => ipcRenderer.invoke('plugin:update', name, data),
    delete: (name: string) => ipcRenderer.invoke('plugin:delete', name),
    getByName: (name: string) => ipcRenderer.invoke('plugin:getByName', name),
    getAll: () => ipcRenderer.invoke('plugin:getAll'),
    getByCategory: (category: string) => ipcRenderer.invoke('plugin:getByCategory', category),
    getEnabled: () => ipcRenderer.invoke('plugin:getEnabled')
  },
  favorite: {
    add: (pluginName: string) => ipcRenderer.invoke('favorite:add', pluginName),
    remove: (pluginName: string) => ipcRenderer.invoke('favorite:remove', pluginName),
    isFavorite: (pluginName: string) => ipcRenderer.invoke('favorite:isFavorite', pluginName),
    getAll: () => ipcRenderer.invoke('favorite:getAll')
  },
  recent: {
    record: (pluginName: string) => ipcRenderer.invoke('recent:record', pluginName),
    getRecent: (limit?: number) => ipcRenderer.invoke('recent:getRecent', limit),
    getFrequent: (limit?: number) => ipcRenderer.invoke('recent:getFrequent', limit)
  },
  pluginConfig: {
    get: (pluginName: string, key: string) =>
      ipcRenderer.invoke('pluginConfig:get', pluginName, key),
    set: (pluginName: string, key: string, value: string) =>
      ipcRenderer.invoke('pluginConfig:set', pluginName, key, value),
    getAll: (pluginName: string) => ipcRenderer.invoke('pluginConfig:getAll', pluginName),
    delete: (pluginName: string, key: string) =>
      ipcRenderer.invoke('pluginConfig:delete', pluginName, key)
  }
}

/**
 * 插件系统 API，暴露给渲染进程使用
 * 渲染进程通过 window.pluginSystem.scan() / .load() 等访问
 */
const pluginSystem = {
  scan: () => ipcRenderer.invoke('plugin:scan'),
  load: (name: string) => ipcRenderer.invoke('plugin:load', name),
  enable: (name: string) => ipcRenderer.invoke('plugin:enable', name),
  disable: (name: string) => ipcRenderer.invoke('plugin:disable', name),
  unload: (name: string) => ipcRenderer.invoke('plugin:unload', name),
  reload: (name: string) => ipcRenderer.invoke('plugin:reload', name),
  install: (packageName: string) => ipcRenderer.invoke('plugin:install', packageName),
  uninstall: (name: string) => ipcRenderer.invoke('plugin:uninstall', name),
  getAll: () => ipcRenderer.invoke('plugin:getAll'),
  getEntry: (name: string) => ipcRenderer.invoke('plugin:getEntry', name),
  readEntry: (name: string) => ipcRenderer.invoke('plugin:readEntry', name),
  dialog: {
    openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options?: { defaultPath?: string }) => ipcRenderer.invoke('dialog:saveFile', options)
  },
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content)
  },
  http: {
    fetch: (
      url: string,
      options?: { method?: string; headers?: Record<string, string>; body?: string }
    ) => ipcRenderer.invoke('http:fetch', url, options)
  },
  window: {
    toggleTop: (pinned?: boolean) => ipcRenderer.invoke('window:toggleTop', pinned)
  },
  data: {
    export: () => ipcRenderer.invoke('data:export'),
    import: (data: unknown, mode: 'merge' | 'overwrite') =>
      ipcRenderer.invoke('data:import', data, mode)
  }
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
