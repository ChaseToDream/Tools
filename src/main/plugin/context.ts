import { clipboard, Notification, shell } from 'electron'
import * as ConfigRepo from '../database/repositories/ConfigRepository'

/** 插件运行时上下文接口，提供系统能力给插件使用 */
export interface PluginContext {
  storage: {
    get: (key: string) => string | null
    set: (key: string, value: string) => void
    delete: (key: string) => void
  }
  clipboard: {
    readText: () => string
    writeText: (text: string) => void
  }
  notification: {
    show: (title: string, body: string) => void
  }
  shell: {
    openExternal: (url: string) => void
  }
}

/**
 * 创建插件沙箱上下文
 * storage 使用 config 表，key 前缀为 plugin:{name}:
 * @param pluginName - 插件名称，用于 storage key 隔离
 * @returns 插件上下文对象
 */
export function createPluginContext(pluginName: string): PluginContext {
  const keyPrefix = `plugin:${pluginName}:`

  return {
    storage: {
      /**
       * 读取插件存储的值
       * @param key - 存储键名（不含前缀）
       */
      get(key: string): string | null {
        return ConfigRepo.get(`${keyPrefix}${key}`)
      },
      /**
       * 写入插件存储值
       * @param key - 存储键名（不含前缀）
       * @param value - 存储值
       */
      set(key: string, value: string): void {
        ConfigRepo.set(`${keyPrefix}${key}`, value)
      },
      /**
       * 删除插件存储值
       * @param key - 存储键名（不含前缀）
       */
      delete(key: string): void {
        ConfigRepo.deleteConfig(`${keyPrefix}${key}`)
      }
    },
    clipboard: {
      /** 读取系统剪贴板文本 */
      readText(): string {
        return clipboard.readText()
      },
      /** 写入文本到系统剪贴板 */
      writeText(text: string): void {
        clipboard.writeText(text)
      }
    },
    notification: {
      /**
       * 显示系统通知
       * @param title - 通知标题
       * @param body - 通知内容
       */
      show(title: string, body: string): void {
        new Notification({ title, body }).show()
      }
    },
    shell: {
      /** 在系统默认浏览器中打开外部链接 */
      openExternal(url: string): void {
        shell.openExternal(url)
      }
    }
  }
}
