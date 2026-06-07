import { existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { PluginManifest, PluginRecord, PluginSource } from '../../shared/types'
import { scanPlugins } from './scanner'
import {
  registerPlugin,
  unregisterPlugin,
  setPluginStatus,
  setPluginError,
  getPlugin
} from './registry'
import * as PluginRepo from '../database/repositories/PluginRepository'

/**
 * 将 PluginManifest 转换为数据库 PluginRecord 格式
 * @param manifest - 插件 manifest
 * @param source - 插件来源
 * @returns 数据库记录对象
 */
function manifestToRecord(manifest: PluginManifest, source: PluginSource): PluginRecord {
  return {
    name: manifest.name,
    version: manifest.version,
    title: manifest.title,
    description: manifest.description,
    category: manifest.category,
    sub_category: manifest.subCategory ?? '',
    icon: manifest.icon ?? '',
    main: manifest.main,
    source,
    enabled: 1,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

/**
 * 判断插件 manifest 对应的目录来源
 * 优先检查开发目录（appPath/plugins），再检查用户数据目录（userData/plugins）
 * @param manifest - 插件 manifest
 * @returns 插件来源类型
 */
function detectSource(manifest: PluginManifest): PluginSource {
  const devPath = join(app.getAppPath(), 'plugins', manifest.name)
  const userPath = join(app.getPath('userData'), 'plugins', manifest.name)
  if (existsSync(devPath)) return 'local'
  if (existsSync(userPath)) return 'npm'
  return 'local'
}

/**
 * 加载单个插件到注册表并同步到数据库
 * @param name - 插件名称
 */
export async function loadPlugin(name: string): Promise<void> {
  const manifests = scanPlugins()
  const manifest = manifests.find((m) => m.name === name)
  if (!manifest) {
    throw new Error(`插件 ${name} 未找到`)
  }
  const source = detectSource(manifest)
  const entryPath = getPluginEntryPath(name)
  if (!entryPath || !existsSync(entryPath)) {
    registerPlugin(manifest)
    setPluginError(name, `入口文件不存在: ${manifest.main}`)
    return
  }
  registerPlugin(manifest)
  /** 同步到数据库：存在则更新，不存在则插入 */
  const existing = PluginRepo.getByName(name)
  const record = manifestToRecord(manifest, source)
  if (existing) {
    PluginRepo.update(name, {
      version: record.version,
      title: record.title,
      description: record.description,
      category: record.category,
      sub_category: record.sub_category,
      icon: record.icon,
      main: record.main,
      source: record.source,
      updated_at: record.updated_at
    })
  } else {
    PluginRepo.insert(record)
  }
}

/**
 * 启用插件
 * @param name - 插件名称
 */
export async function enablePlugin(name: string): Promise<void> {
  const info = getPlugin(name)
  if (!info) {
    throw new Error(`插件 ${name} 未加载`)
  }
  setPluginStatus(name, 'loaded')
  PluginRepo.update(name, { enabled: 1 })
}

/**
 * 禁用插件
 * @param name - 插件名称
 */
export async function disablePlugin(name: string): Promise<void> {
  const info = getPlugin(name)
  if (!info) {
    throw new Error(`插件 ${name} 未加载`)
  }
  setPluginStatus(name, 'disabled')
  PluginRepo.update(name, { enabled: 0 })
}

/**
 * 卸载插件：从注册表移除并从数据库删除记录
 * @param name - 插件名称
 */
export async function unloadPlugin(name: string): Promise<void> {
  unregisterPlugin(name)
  PluginRepo.deletePlugin(name)
}

/**
 * 重新加载插件
 * @param name - 插件名称
 */
export async function reloadPlugin(name: string): Promise<void> {
  unregisterPlugin(name)
  await loadPlugin(name)
}

/**
 * 启动时加载所有已发现的插件
 * 扫描插件目录，逐个加载，单个插件失败不影响其他插件
 */
export async function loadAllPlugins(): Promise<void> {
  const manifests = scanPlugins()
  for (const manifest of manifests) {
    try {
      await loadPlugin(manifest.name)
      console.log(`[PluginLifecycle] 已加载: ${manifest.name}`)
    } catch (err) {
      console.error(`[PluginLifecycle] 加载失败: ${manifest.name}`, err)
      registerPlugin(manifest)
      setPluginError(manifest.name, String(err))
    }
  }
}

/**
 * 获取插件入口文件的绝对路径
 * @param name - 插件名称
 * @returns 入口文件绝对路径，插件不存在时返回 null
 */
export function getPluginEntryPath(name: string): string | null {
  const info = getPlugin(name)
  if (!info) return null
  const manifest = info.manifest
  /** 优先查找开发目录，再查找用户数据目录 */
  const devDir = join(app.getAppPath(), 'plugins', name)
  const userDir = join(app.getPath('userData'), 'plugins', name)
  const baseDir = existsSync(devDir) ? devDir : userDir
  return join(baseDir, manifest.main)
}
