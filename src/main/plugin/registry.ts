import type { PluginManifest, PluginInfo, PluginStatus } from '../../shared/types'

/** 内存中的插件注册表，键为插件 name */
const registry = new Map<string, PluginInfo>()

/**
 * 注册插件到内存注册表
 * @param manifest - 插件 manifest
 */
export function registerPlugin(manifest: PluginManifest): void {
  registry.set(manifest.name, { manifest, status: 'loaded' })
}

/**
 * 从注册表中移除插件
 * @param name - 插件名称
 */
export function unregisterPlugin(name: string): void {
  registry.delete(name)
}

/**
 * 获取指定插件信息
 * @param name - 插件名称
 * @returns 插件信息，不存在则返回 undefined
 */
export function getPlugin(name: string): PluginInfo | undefined {
  return registry.get(name)
}

/**
 * 获取注册表中所有插件信息
 * @returns 插件信息列表
 */
export function getAllPlugins(): PluginInfo[] {
  return Array.from(registry.values())
}

/**
 * 按分类获取插件列表
 * @param category - 分类名称
 * @returns 该分类下的插件列表
 */
export function getPluginsByCategory(category: string): PluginInfo[] {
  return Array.from(registry.values()).filter((info) => info.manifest.category === category)
}

/**
 * 设置插件运行状态
 * @param name - 插件名称
 * @param status - 目标状态
 */
export function setPluginStatus(name: string, status: PluginStatus): void {
  const info = registry.get(name)
  if (info) {
    info.status = status
  }
}

/**
 * 设置插件错误信息
 * @param name - 插件名称
 * @param error - 错误描述
 */
export function setPluginError(name: string, error: string): void {
  const info = registry.get(name)
  if (info) {
    info.status = 'error'
    info.error = error
  }
}

/**
 * 清空注册表（主要用于测试或重置）
 */
export function clearRegistry(): void {
  registry.clear()
}
