import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { initDatabase, closeDatabase } from './database/database'
import { registerIpcHandlers } from './database/ipc'
import { loadAllPlugins } from './plugin/lifecycle'
import { registerPluginIpcHandlers } from './plugin/ipc'

let mainWindow: BrowserWindow | null = null

/**
 * 应用程序初始化，创建主窗口、初始化数据库并注册 IPC handlers
 */
app.whenReady().then(async () => {
  /** 初始化数据库连接并执行迁移 */
  initDatabase()

  /** 注册数据库 IPC 通信 handlers */
  registerIpcHandlers()

  /** 加载所有已发现的插件 */
  await loadAllPlugins()

  /** 注册插件系统 IPC 通信 handlers */
  registerPluginIpcHandlers()

  mainWindow = createMainWindow()

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

/** 所有窗口关闭时退出应用（macOS 除外），并关闭数据库连接 */
app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
