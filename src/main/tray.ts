import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import * as ConfigRepo from './database/repositories/ConfigRepository'

let tray: Tray | null = null

/**
 * 创建系统托盘图标和右键菜单
 * @param mainWindow - 主窗口实例
 */
export function createTray(mainWindow: BrowserWindow): void {
  const iconPath = join(app.getAppPath(), 'resources', 'icon.svg')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('ToolBox')

  updateContextMenu(mainWindow)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

/**
 * 更新托盘右键菜单（含置顶状态同步）
 * @param mainWindow - 主窗口实例
 */
export function updateContextMenu(mainWindow: BrowserWindow): void {
  if (!tray) return

  const isPinned = mainWindow.isAlwaysOnTop()
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: '置顶窗口',
      type: 'checkbox',
      checked: isPinned,
      click: () => {
        mainWindow.setAlwaysOnTop(!isPinned)
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

/**
 * 判断是否启用最小化到托盘
 * @returns 是否最小化到托盘（默认 true）
 */
export function shouldMinimizeToTray(): boolean {
  const val = ConfigRepo.get('minimizeToTray')
  return val !== 'false'
}
