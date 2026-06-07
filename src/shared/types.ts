/** 插件来源类型 */
export type PluginSource = 'local' | 'npm'

/** 插件运行状态 */
export type PluginStatus = 'loaded' | 'disabled' | 'error'

/** 插件 manifest 定义 */
export interface PluginManifest {
  name: string
  version: string
  title: string
  description: string
  category: string
  subCategory?: string
  icon?: string
  main: string
  dependencies?: string[]
  config?: PluginConfigItem[]
}

/** 注册表中的插件信息 */
export interface PluginInfo {
  manifest: PluginManifest
  status: PluginStatus
  error?: string
}

/** 插件记录（数据库表结构） */
export interface PluginRecord {
  name: string
  version: string
  title: string
  description: string
  category: string
  sub_category: string
  icon: string
  main: string
  source: PluginSource
  enabled: number
  installed_at: string
  updated_at: string
}

/** 收藏记录 */
export interface FavoriteRecord {
  plugin_name: string
  created_at: string
}

/** 配置 API 接口 */
export interface ConfigApi {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
  getAll: () => Promise<Record<string, string>>
}

/** 插件数据库 API 接口 */
export interface PluginDbApi {
  insert: (plugin: PluginRecord) => Promise<void>
  update: (name: string, data: Partial<PluginRecord>) => Promise<void>
  delete: (name: string) => Promise<void>
  getByName: (name: string) => Promise<PluginRecord | null>
  getAll: () => Promise<PluginRecord[]>
  getByCategory: (category: string) => Promise<PluginRecord[]>
  getEnabled: () => Promise<PluginRecord[]>
}

/** 收藏 API 接口 */
export interface FavoriteApi {
  add: (pluginName: string) => Promise<void>
  remove: (pluginName: string) => Promise<void>
  isFavorite: (pluginName: string) => Promise<boolean>
  getAll: () => Promise<FavoriteRecord[]>
}

/** 插件系统 API 接口（IPC 暴露给渲染进程） */
export interface PluginSystemApi {
  scan: () => Promise<PluginManifest[]>
  load: (name: string) => Promise<void>
  enable: (name: string) => Promise<void>
  disable: (name: string) => Promise<void>
  unload: (name: string) => Promise<void>
  reload: (name: string) => Promise<void>
  install: (packageName: string) => Promise<PluginManifest>
  uninstall: (name: string) => Promise<void>
  getAll: () => Promise<PluginInfo[]>
  getEntry: (name: string) => Promise<string | null>
  /** 读取插件入口文件内容，返回代码字符串 */
  readEntry: (name: string) => Promise<string | null>
}

/** 系统能力 API 接口（剪贴板、通知、Shell） */
export interface SystemApi {
  clipboard: {
    readText: () => Promise<string>
    writeText: (text: string) => Promise<void>
  }
  notification: {
    show: (title: string, body: string) => Promise<void>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
  }
}

/** 数据库 API 总接口（通过 contextBridge 暴露给渲染进程） */
export interface DbApi {
  config: ConfigApi
  plugin: PluginDbApi
  favorite: FavoriteApi
}

/** 分类树节点 */
export interface CategoryNode {
  /** 分类名称 */
  name: string
  /** 子分类列表 */
  children: CategoryNode[]
  /** 该分类下的插件列表 */
  plugins: PluginInfo[]
}

/** 插件运行时上下文接口，提供系统能力给插件使用 */
export interface PluginContext {
  /** 插件专属键值存储（按插件名自动隔离） */
  storage: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
    delete: (key: string) => Promise<void>
  }
  /** 系统剪贴板操作 */
  clipboard: {
    readText: () => Promise<string>
    writeText: (text: string) => Promise<void>
  }
  /** 系统通知 */
  notification: {
    show: (title: string, body: string) => Promise<void>
  }
  /** 外部链接与系统 Shell */
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  /** 文件读写 */
  fs: {
    readFile: (path: string) => Promise<string | null>
    writeFile: (path: string, content: string) => Promise<boolean>
  }
  /** 文件对话框 */
  dialog: {
    openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>
    saveFile: (options?: { defaultPath?: string }) => Promise<string | null>
  }
  /** HTTP 请求 */
  http: {
    fetch: (url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ ok: boolean; status: number; data: unknown }>
  }
  /** 插件配置读写 */
  config: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
  }
}

/** 渲染进程可用的全局 API */
export interface ExposedApi {
  db: DbApi
  pluginSystem: PluginSystemApi
  system: SystemApi
}

/** 最近使用记录 */
export interface RecentUsageRecord {
  plugin_name: string
  use_count: number
  last_used_at: string
}

/** 插件配置项声明（plugin.json 中定义） */
export interface PluginConfigItem {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean'
  default?: string | number | boolean
}

/** 插件配置记录（数据库表结构） */
export interface PluginConfigRecord {
  plugin_name: string
  config_key: string
  config_value: string
}

/** 数据导出格式 */
export interface ExportData {
  version: string
  exportedAt: string
  favorites: string[]
  config: Record<string, string>
  pluginConfig: Record<string, Record<string, string>>
  usageStats: Record<string, { count: number; lastUsed: string }>
}
