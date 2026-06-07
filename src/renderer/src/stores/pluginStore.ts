import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { PluginInfo, PluginContext } from '../../../shared/types'
import type { Component } from 'vue'

/**
 * 插件运行时 Pinia Store
 * 管理当前运行的插件状态、动态组件加载和 PluginContext 创建
 */
export const usePluginStore = defineStore('plugin', () => {
  /** 当前运行的插件信息 */
  const currentPlugin = ref<PluginInfo | null>(null)

  /** 当前插件的动态组件（shallowRef 避免深层响应式代理） */
  const pluginComponent = shallowRef<Component | null>(null)

  /** 插件是否正在加载 */
  const pluginLoading = ref(false)

  /** 插件加载错误信息 */
  const pluginError = ref<string | null>(null)

  /**
   * 为指定插件创建渲染进程侧的 PluginContext
   * storage 使用 window.db.config（key 加前缀隔离）
   * clipboard / notification / shell 使用 window.system IPC
   * @param pluginName - 插件名称，用于 storage key 隔离
   * @returns PluginContext 对象
   */
  function createPluginContext(pluginName: string): PluginContext {
    const keyPrefix = `plugin:${pluginName}:`

    return {
      storage: {
        /**
         * 读取插件存储的值
         * @param key - 存储键名（不含前缀）
         */
        async get(key: string): Promise<string | null> {
          return window.db.config.get(`${keyPrefix}${key}`)
        },
        /**
         * 写入插件存储值
         * @param key - 存储键名（不含前缀）
         * @param value - 存储值
         */
        async set(key: string, value: string): Promise<void> {
          await window.db.config.set(`${keyPrefix}${key}`, value)
        },
        /**
         * 删除插件存储值
         * @param key - 存储键名（不含前缀）
         */
        async delete(key: string): Promise<void> {
          await window.db.config.delete(`${keyPrefix}${key}`)
        }
      },
      clipboard: {
        /** 读取系统剪贴板文本 */
        async readText(): Promise<string> {
          return window.system.clipboard.readText()
        },
        /** 写入文本到系统剪贴板 */
        async writeText(text: string): Promise<void> {
          await window.system.clipboard.writeText(text)
        }
      },
      notification: {
        /**
         * 显示系统通知
         * @param title - 通知标题
         * @param body - 通知内容
         */
        async show(title: string, body: string): Promise<void> {
          await window.system.notification.show(title, body)
        }
      },
      shell: {
        /** 在系统默认浏览器中打开外部链接 */
        async openExternal(url: string): Promise<void> {
          await window.system.shell.openExternal(url)
        }
      },
      fs: {
        /** 读取文件内容 */
        async readFile(path: string): Promise<string | null> {
          return window.pluginSystem.fs.readFile(path)
        },
        /** 写入文件内容 */
        async writeFile(path: string, content: string): Promise<boolean> {
          return window.pluginSystem.fs.writeFile(path, content)
        }
      },
      dialog: {
        /** 打开文件选择对话框 */
        async openFile(options?: { filters?: { name: string; extensions: string[] }[] }): Promise<string | null> {
          return window.pluginSystem.dialog.openFile(options)
        },
        /** 打开保存文件对话框 */
        async saveFile(options?: { defaultPath?: string }): Promise<string | null> {
          return window.pluginSystem.dialog.saveFile(options)
        }
      },
      http: {
        /** 发起 HTTP 请求 */
        async fetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<{ ok: boolean; status: number; data: unknown }> {
          return window.pluginSystem.http.fetch(url, options)
        }
      },
      config: {
        /** 读取插件配置 */
        async get(key: string): Promise<string | null> {
          return window.db.pluginConfig.get(pluginName, key)
        },
        /** 写入插件配置 */
        async set(key: string, value: string): Promise<void> {
          await window.db.pluginConfig.set(pluginName, key, value)
        }
      }
    }
  }

  /**
   * 通过 IPC 读取插件入口文件代码，用 new Function() 执行并提取组件定义
   * 插件使用 CommonJS 格式（module.exports），此处模拟 module 对象
   * @param name - 插件名称
   * @returns 插件组件选项对象，失败返回 null
   */
  async function loadPluginEntry(name: string): Promise<Component | null> {
    const code = await window.pluginSystem.readEntry(name)
    if (!code) return null

    try {
      // 模拟 CommonJS 的 module/exports 环境
      const mod = { exports: {} as Record<string, unknown> }
      const fn = new Function('module', 'exports', code)
      fn(mod, mod.exports)
      return mod.exports as Component
    } catch (err) {
      console.error('[pluginStore] 执行插件代码失败:', err)
      return null
    }
  }

  /**
   * 加载并运行指定插件
   * 从 categoryStore 查找插件信息，读取入口代码，创建 PluginContext
   * @param name - 插件名称
   */
  async function loadPlugin(name: string): Promise<void> {
    pluginLoading.value = true
    pluginError.value = null
    pluginComponent.value = null

    try {
      // 从已有插件列表中查找插件信息
      const plugins = await window.pluginSystem.getAll()
      const plugin = plugins.find((p) => p.manifest.name === name)
      if (!plugin) {
        pluginError.value = `插件 "${name}" 未找到`
        return
      }

      currentPlugin.value = plugin

      // 读取并执行插件入口代码
      const component = await loadPluginEntry(name)
      if (!component) {
        pluginError.value = `插件 "${name}" 入口文件加载失败`
        return
      }

      pluginComponent.value = component

      // 记录插件使用
      window.db.recent.record(name)
    } catch (err) {
      pluginError.value = String(err)
      console.error('[pluginStore] 加载插件失败:', err)
    } finally {
      pluginLoading.value = false
    }
  }

  /**
   * 卸载当前插件，清空运行时状态
   */
  function unloadPlugin(): void {
    currentPlugin.value = null
    pluginComponent.value = null
    pluginLoading.value = false
    pluginError.value = null
  }

  return {
    currentPlugin,
    pluginComponent,
    pluginLoading,
    pluginError,
    createPluginContext,
    loadPlugin,
    unloadPlugin
  }
})
