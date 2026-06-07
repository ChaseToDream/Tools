/** 插件来源类型 */
export type PluginSource = 'local' | 'npm'

/** 插件运行状态 */
export type PluginStatus = 'loaded' | 'disabled' | 'error'

/** 插件 manifest 定义 */
export interface PluginManifest {
  /** 插件唯一标识，只能包含小写字母、数字和连字符 */
  name: string
  /** 插件版本号，遵循 semver 规范 */
  version: string
  /** 插件显示标题 */
  title: string
  /** 插件功能描述 */
  description: string
  /** 插件分类 */
  category: string
  /** 插件子分类 */
  subCategory?: string
  /** 插件图标名称（Element Plus 图标组件名） */
  icon?: string
  /** 插件入口文件路径（相对于插件根目录） */
  main: string
  /** 插件依赖的其他插件名称列表 */
  dependencies?: string[]
  /** 插件配置项声明 */
  config?: PluginConfigItem[]
}

/** 注册表中的插件信息 */
export interface PluginInfo {
  /** 插件 manifest 数据 */
  manifest: PluginManifest
  /** 当前运行状态 */
  status: PluginStatus
  /** 错误信息（状态为 error 时有效） */
  error?: string
}

/** 插件记录（数据库表结构） */
export interface PluginRecord {
  /** 插件名称（主键） */
  name: string
  /** 插件版本 */
  version: string
  /** 插件显示标题 */
  title: string
  /** 插件功能描述 */
  description: string
  /** 插件分类 */
  category: string
  /** 插件子分类 */
  sub_category: string
  /** 插件图标 */
  icon: string
  /** 插件入口文件路径 */
  main: string
  /** 插件来源 */
  source: PluginSource
  /** 是否启用（1=启用，0=禁用） */
  enabled: number
  /** 安装时间（ISO 8601 格式） */
  installed_at: string
  /** 更新时间（ISO 8601 格式） */
  updated_at: string
}

/** 收藏记录 */
export interface FavoriteRecord {
  /** 插件名称（外键） */
  plugin_name: string
  /** 收藏时间（ISO 8601 格式） */
  created_at: string
}

/** 配置 API 接口 */
export interface ConfigApi {
  /** 根据键名获取配置值 */
  get: (key: string) => Promise<string | null>
  /** 设置配置项 */
  set: (key: string, value: string) => Promise<void>
  /** 删除配置项 */
  delete: (key: string) => Promise<void>
  /** 获取所有配置项 */
  getAll: () => Promise<Record<string, string>>
}

/** 插件数据库 API 接口 */
export interface PluginDbApi {
  /** 插入插件记录 */
  insert: (plugin: PluginRecord) => Promise<void>
  /** 更新插件记录 */
  update: (name: string, data: Partial<PluginRecord>) => Promise<void>
  /** 删除插件记录 */
  delete: (name: string) => Promise<void>
  /** 根据名称查询插件 */
  getByName: (name: string) => Promise<PluginRecord | null>
  /** 获取所有插件记录 */
  getAll: () => Promise<PluginRecord[]>
  /** 根据分类查询插件 */
  getByCategory: (category: string) => Promise<PluginRecord[]>
  /** 获取所有已启用的插件 */
  getEnabled: () => Promise<PluginRecord[]>
}

/** 收藏 API 接口 */
export interface FavoriteApi {
  /** 添加收藏 */
  add: (pluginName: string) => Promise<void>
  /** 取消收藏 */
  remove: (pluginName: string) => Promise<void>
  /** 判断是否已收藏 */
  isFavorite: (pluginName: string) => Promise<boolean>
  /** 获取所有收藏记录 */
  getAll: () => Promise<FavoriteRecord[]>
}

/** 插件系统 API 接口（IPC 暴露给渲染进程） */
export interface PluginSystemApi {
  /** 扫描所有插件目录 */
  scan: () => Promise<PluginManifest[]>
  /** 加载指定插件 */
  load: (name: string) => Promise<void>
  /** 启用插件 */
  enable: (name: string) => Promise<void>
  /** 禁用插件 */
  disable: (name: string) => Promise<void>
  /** 卸载插件 */
  unload: (name: string) => Promise<void>
  /** 重新加载插件 */
  reload: (name: string) => Promise<void>
  /** 安装 npm 插件 */
  install: (packageName: string) => Promise<PluginManifest>
  /** 卸载 npm 插件 */
  uninstall: (name: string) => Promise<void>
  /** 获取所有插件信息 */
  getAll: () => Promise<PluginInfo[]>
  /** 获取插件入口文件路径 */
  getEntry: (name: string) => Promise<string | null>
  /** 读取插件入口文件内容，返回代码字符串 */
  readEntry: (name: string) => Promise<string | null>
}

/** 系统能力 API 接口（剪贴板、通知、Shell） */
export interface SystemApi {
  /** 剪贴板操作 */
  clipboard: {
    /** 读取剪贴板文本 */
    readText: () => Promise<string>
    /** 写入文本到剪贴板 */
    writeText: (text: string) => Promise<void>
  }
  /** 系统通知 */
  notification: {
    /** 显示系统通知 */
    show: (title: string, body: string) => Promise<void>
  }
  /** 外部链接与系统 Shell */
  shell: {
    /** 在系统默认浏览器中打开外部链接 */
    openExternal: (url: string) => Promise<void>
  }
}

/** 数据库 API 总接口（通过 contextBridge 暴露给渲染进程） */
export interface DbApi {
  /** 配置相关 API */
  config: ConfigApi
  /** 插件数据库 API */
  plugin: PluginDbApi
  /** 收藏相关 API */
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
    /** 读取插件存储的值 */
    get: (key: string) => Promise<string | null>
    /** 写入插件存储值 */
    set: (key: string, value: string) => Promise<void>
    /** 删除插件存储值 */
    delete: (key: string) => Promise<void>
  }
  /** 系统剪贴板操作 */
  clipboard: {
    /** 读取系统剪贴板文本 */
    readText: () => Promise<string>
    /** 写入文本到系统剪贴板 */
    writeText: (text: string) => Promise<void>
  }
  /** 系统通知 */
  notification: {
    /** 显示系统通知 */
    show: (title: string, body: string) => Promise<void>
  }
  /** 外部链接与系统 Shell */
  shell: {
    /** 在系统默认浏览器中打开外部链接 */
    openExternal: (url: string) => Promise<void>
  }
  /** 文件读写 */
  fs: {
    /** 读取文件内容 */
    readFile: (path: string) => Promise<string | null>
    /** 写入文件内容 */
    writeFile: (path: string, content: string) => Promise<boolean>
  }
  /** 文件对话框 */
  dialog: {
    /** 打开文件选择对话框 */
    openFile: (options?: {
      filters?: { name: string; extensions: string[] }[]
    }) => Promise<string | null>
    /** 打开保存文件对话框 */
    saveFile: (options?: { defaultPath?: string }) => Promise<string | null>
  }
  /** HTTP 请求 */
  http: {
    /** 发起 HTTP 请求 */
    fetch: (
      url: string,
      options?: { method?: string; headers?: Record<string, string>; body?: string }
    ) => Promise<{ ok: boolean; status: number; data: unknown }>
  }
  /** 插件配置读写 */
  config: {
    /** 读取插件配置 */
    get: (key: string) => Promise<string | null>
    /** 写入插件配置 */
    set: (key: string, value: string) => Promise<void>
  }
}

/** 渲染进程可用的全局 API */
export interface ExposedApi {
  /** 数据库 API */
  db: DbApi
  /** 插件系统 API */
  pluginSystem: PluginSystemApi
  /** 系统能力 API */
  system: SystemApi
}

/** 最近使用记录 */
export interface RecentUsageRecord {
  /** 插件名称 */
  plugin_name: string
  /** 使用次数 */
  use_count: number
  /** 最后使用时间（ISO 8601 格式） */
  last_used_at: string
}

/** 插件配置项声明（plugin.json 中定义） */
export interface PluginConfigItem {
  /** 配置键名 */
  key: string
  /** 配置显示标签 */
  label: string
  /** 配置值类型 */
  type: 'string' | 'number' | 'boolean'
  /** 默认值 */
  default?: string | number | boolean
}

/** 插件配置记录（数据库表结构） */
export interface PluginConfigRecord {
  /** 插件名称 */
  plugin_name: string
  /** 配置键名 */
  config_key: string
  /** 配置值 */
  config_value: string
}

/** 数据导出格式 */
export interface ExportData {
  /** 导出数据版本 */
  version: string
  /** 导出时间（ISO 8601 格式） */
  exportedAt: string
  /** 收藏的插件名称列表 */
  favorites: string[]
  /** 用户配置键值对 */
  config: Record<string, string>
  /** 插件配置（插件名 -> 配置键值对） */
  pluginConfig: Record<string, Record<string, string>>
  /** 使用统计（插件名 -> 使用次数和最后使用时间） */
  usageStats: Record<string, { count: number; lastUsed: string }>
}
