import { ipcMain, clipboard, Notification, shell } from 'electron'

/**
 * 注册系统能力相关的 IPC handlers
 * 包括剪贴板、通知、外部链接打开
 */
export function registerSystemIpcHandlers(): void {
  /** 读取系统剪贴板文本 */
  ipcMain.handle('clipboard:readText', () => clipboard.readText())

  /**
   * 写入文本到系统剪贴板
   * @param text - 要写入的文本
   */
  ipcMain.handle('clipboard:writeText', (_e, text: string) => clipboard.writeText(text))

  /**
   * 显示系统通知
   * @param title - 通知标题
   * @param body - 通知内容
   */
  ipcMain.handle('notification:show', (_e, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  /**
   * 在系统默认浏览器中打开外部链接
   * @param url - 要打开的 URL
   */
  ipcMain.handle('shell:openExternal', (_e, url: string) => shell.openExternal(url))
}
