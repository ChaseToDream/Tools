import { ipcMain } from 'electron'

/**
 * 注册 HTTP 请求相关的 IPC handlers
 * 渲染进程通过此通道发起网络请求，避免 CORS 限制
 */
export function registerHttpIpcHandlers(): void {
  /**
   * 发起 HTTP 请求
   * @param url - 请求 URL
   * @param options - 可选的请求配置（方法、请求头、请求体）
   * @returns 包含 ok、status、data 的响应对象
   */
  ipcMain.handle(
    'http:fetch',
    async (
      _e,
      url: string,
      options?: { method?: string; headers?: Record<string, string>; body?: string }
    ) => {
      try {
        const resp = await fetch(url, {
          method: options?.method ?? 'GET',
          headers: options?.headers,
          body: options?.body
        })
        const data = await resp.json().catch(() => null)
        return { ok: resp.ok, status: resp.status, data }
      } catch {
        return { ok: false, status: 0, data: null }
      }
    }
  )
}
