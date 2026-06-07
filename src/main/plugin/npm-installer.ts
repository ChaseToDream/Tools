import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { execFile } from 'child_process'
import type { PluginManifest } from '../../shared/types'
import { validateManifest } from './manifest'
import { loadPlugin } from './lifecycle'

/**
 * 获取用户数据目录下的插件安装路径
 * @returns 用户插件目录绝对路径
 */
function getUserPluginsDir(): string {
  const dir = join(app.getPath('userData'), 'plugins')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * 通过 npm install 安装插件包到用户数据目录
 * @param packageName - npm 包名（支持 @scope/name 和 name@version 格式）
 * @returns 安装成功后的插件 manifest
 */
export async function installNpmPlugin(packageName: string): Promise<PluginManifest> {
  const pluginsDir = getUserPluginsDir()
  /** 在用户插件目录下执行 npm install */
  await runNpmInstall(pluginsDir, packageName)

  /**
   * 从包名提取 npm 安装后的目录名
   * 处理 @scope/name@version 和 name@version 格式
   * @scope/name@1.0.0 -> @scope/name
   * name@1.0.0 -> name
   */
  const packageDir = packageName.replace(/(@[^/]+\/[^@]+)@.+/, '$1').replace(/^([^@]+)@.+/, '$1')
  const pluginDir = join(pluginsDir, 'node_modules', packageDir)
  const manifestPath = join(pluginDir, 'plugin.json')

  if (!existsSync(manifestPath)) {
    throw new Error(`npm 包 ${packageName} 安装成功但缺少 plugin.json`)
  }

  const { readFileSync } = await import('fs')
  const raw = readFileSync(manifestPath, 'utf-8')
  const json = JSON.parse(raw)
  const result = validateManifest(json)

  if (!result.success) {
    throw new Error(`npm 包 ${packageName} manifest 校验失败: ${result.error}`)
  }

  /** 加载插件到注册表 */
  await loadPlugin(result.data!.name)
  return result.data!
}

/**
 * 卸载 npm 安装的插件
 * @param name - 插件名称（非 npm 包名，而是 manifest 中的 name）
 */
export async function uninstallNpmPlugin(name: string): Promise<void> {
  const pluginsDir = getUserPluginsDir()
  await runNpmUninstall(pluginsDir, name)
}

/**
 * 执行 npm install 子进程
 * @param cwd - 工作目录
 * @param packageName - 包名
 */
function runNpmInstall(cwd: string, packageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      'npm',
      ['install', packageName, '--no-save', '--no-package-lock'],
      { cwd, shell: true },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`npm install 失败: ${stderr || error.message}`))
          return
        }
        resolve()
      }
    )
  })
}

/**
 * 执行 npm uninstall 子进程
 * @param cwd - 工作目录
 * @param packageName - 包名
 */
function runNpmUninstall(cwd: string, packageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      'npm',
      ['uninstall', packageName, '--no-save'],
      { cwd, shell: true },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`npm uninstall 失败: ${stderr || error.message}`))
          return
        }
        resolve()
      }
    )
  })
}
