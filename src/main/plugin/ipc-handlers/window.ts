import { ipcMain, BrowserWindow } from 'electron'

/**
 * 注册窗口控制相关的 IPC handlers
 * 包括窗口置顶切换
 */
export function registerWindowIpcHandlers(): void {
  /**
   * 切换窗口置顶状态
   * @param pinned - 是否置顶，不传则取反当前状态
   * @returns 切换后的置顶状态
   */
  ipcMain.handle('window:toggleTop', (_e, pinned?: boolean) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return false
    const newState = pinned ?? !win.isAlwaysOnTop()
    win.setAlwaysOnTop(newState)
    return newState
  })
}
