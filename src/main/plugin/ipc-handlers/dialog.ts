import { ipcMain, dialog, BrowserWindow } from 'electron'

/**
 * 注册文件对话框相关的 IPC handlers
 * 包括打开文件和保存文件对话框
 */
export function registerDialogIpcHandlers(): void {
  /**
   * 打开文件选择对话框
   * @param options - 可选的过滤器配置
   * @returns 选中的文件路径，取消时返回 null
   */
  ipcMain.handle(
    'dialog:openFile',
    async (_e, options?: { filters?: { name: string; extensions: string[] }[] }) => {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return null
      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: options?.filters
      })
      return result.canceled ? null : result.filePaths[0]
    }
  )

  /**
   * 打开保存文件对话框
   * @param options - 可选的默认路径配置
   * @returns 保存的文件路径，取消时返回 null
   */
  ipcMain.handle('dialog:saveFile', async (_e, options?: { defaultPath?: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showSaveDialog(win, {
      defaultPath: options?.defaultPath
    })
    return result.canceled ? null : result.filePath
  })
}
