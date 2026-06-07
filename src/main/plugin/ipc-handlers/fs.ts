import { ipcMain } from 'electron'
import { readFileSync, writeFileSync } from 'fs'

/**
 * 注册文件系统相关的 IPC handlers
 * 包括文件读写操作
 */
export function registerFsIpcHandlers(): void {
  /**
   * 读取文件内容
   * @param path - 文件绝对路径
   * @returns 文件内容字符串，失败返回 null
   */
  ipcMain.handle('fs:readFile', (_e, path: string): string | null => {
    try {
      return readFileSync(path, 'utf-8')
    } catch {
      return null
    }
  })

  /**
   * 写入文件内容
   * @param path - 文件绝对路径
   * @param content - 要写入的内容
   * @returns 是否写入成功
   */
  ipcMain.handle('fs:writeFile', (_e, path: string, content: string): boolean => {
    try {
      writeFileSync(path, content, 'utf-8')
      return true
    } catch {
      return false
    }
  })
}
