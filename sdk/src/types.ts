/**
 * 插件来源类型
 */
export type PluginSource = 'local' | 'npm'

/**
 * 插件运行状态
 */
export type PluginStatus = 'loaded' | 'disabled' | 'error'

/**
 * 插件 manifest 定义
 */
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

/**
 * 注册表中的插件信息
 */
export interface PluginInfo {
  /** 插件 manifest 数据 */
  manifest: PluginManifest
  /** 当前运行状态 */
  status: PluginStatus
  /** 错误信息（状态为 error 时有效） */
  error?: string
}

/**
 * 插件配置项声明（plugin.json 中定义）
 */
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
