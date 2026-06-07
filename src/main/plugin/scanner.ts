import { app } from 'electron'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'
import type { PluginManifest } from '../../shared/types'
import { validateManifest } from './manifest'

/**
 * 获取所有插件扫描目录
 * 项目根目录/plugins/ 用于开发，用户数据目录/plugins/ 用于用户安装
 * @returns 插件目录路径数组
 */
function getPluginDirs(): string[] {
  const dirs: string[] = []
  /** 项目根目录下的 plugins/（开发用） */
  const devDir = join(app.getAppPath(), 'plugins')
  if (existsSync(devDir)) {
    dirs.push(devDir)
  }
  /** 用户数据目录下的 plugins/（用户安装） */
  const userDir = join(app.getPath('userData'), 'plugins')
  if (existsSync(userDir)) {
    dirs.push(userDir)
  }
  return dirs
}

/**
 * 从单个插件目录中读取并校验 manifest
 * @param pluginDir - 插件子目录路径
 * @returns 校验通过的 manifest，校验失败返回 null 并打印警告
 */
function readManifest(pluginDir: string): PluginManifest | null {
  const manifestPath = join(pluginDir, 'plugin.json')
  if (!existsSync(manifestPath)) {
    console.warn(`[PluginScanner] 跳过 ${pluginDir}：缺少 plugin.json`)
    return null
  }
  try {
    const raw = readFileSync(manifestPath, 'utf-8')
    const json = JSON.parse(raw)
    const result = validateManifest(json)
    if (!result.success) {
      console.warn(`[PluginScanner] ${pluginDir} manifest 校验失败: ${result.error}`)
      return null
    }
    return result.data!
  } catch (err) {
    console.warn(`[PluginScanner] 读取 ${manifestPath} 失败:`, err)
    return null
  }
}

/**
 * 扫描所有插件目录，返回校验通过的 manifest 列表
 * 同名插件以先扫描到的为准（开发目录优先于用户目录）
 * @returns 去重后的 PluginManifest 数组
 */
export function scanPlugins(): PluginManifest[] {
  const seen = new Set<string>()
  const manifests: PluginManifest[] = []

  for (const dir of getPluginDirs()) {
    let entries: string[]
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (seen.has(entry.name)) continue
      const pluginDir = join(dir, entry.name)
      const manifest = readManifest(pluginDir)
      if (manifest) {
        seen.add(entry.name)
        manifests.push(manifest)
      }
    }
  }
  return manifests
}
