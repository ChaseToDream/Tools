/**
 * 插件运行时上下文接口，提供系统能力给插件使用
 */
export interface PluginContext {
  /** 插件专属键值存储（按插件名自动隔离） */
  storage: {
    /** 读取存储值 */
    get: (key: string) => string | null
    /** 写入存储值 */
    set: (key: string, value: string) => void
    /** 删除存储值 */
    delete: (key: string) => void
  }
  /** 系统剪贴板操作 */
  clipboard: {
    /** 读取剪贴板文本 */
    readText: () => string
    /** 写入文本到剪贴板 */
    writeText: (text: string) => void
  }
  /** 系统通知 */
  notification: {
    /** 显示系统通知 */
    show: (title: string, body: string) => void
  }
  /** 外部链接与系统 Shell */
  shell: {
    /** 在默认浏览器中打开链接 */
    openExternal: (url: string) => void
  }
}
