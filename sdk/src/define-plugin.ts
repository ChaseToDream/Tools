import type { PluginManifest } from './types'

/**
 * 插件定义辅助函数，提供类型安全的 manifest 编写体验
 * 运行时为 identity function，仅做类型校验
 * @param options - 插件 manifest 配置
 * @returns 原样返回传入的 manifest 对象
 */
export function definePlugin(options: PluginManifest): PluginManifest {
  return options
}
