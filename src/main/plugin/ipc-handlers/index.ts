import { registerSystemIpcHandlers } from './system'
import { registerDialogIpcHandlers } from './dialog'
import { registerFsIpcHandlers } from './fs'
import { registerHttpIpcHandlers } from './http'
import { registerWindowIpcHandlers } from './window'
import { registerDataTransferIpcHandlers } from './data-transfer'
import { registerPluginLifecycleIpcHandlers } from './plugin-lifecycle'

/**
 * 注册所有插件系统相关的 IPC handlers
 * 将各模块的 IPC 注册函数统一导出，供主进程入口调用
 */
export function registerPluginIpcHandlers(): void {
  registerPluginLifecycleIpcHandlers()
  registerSystemIpcHandlers()
  registerDialogIpcHandlers()
  registerFsIpcHandlers()
  registerHttpIpcHandlers()
  registerWindowIpcHandlers()
  registerDataTransferIpcHandlers()
}
