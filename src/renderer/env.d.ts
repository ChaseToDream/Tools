/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

import type {
  DbApi,
  PluginSystemApi,
  SystemApi,
  RecentUsageRecord,
  PluginConfigRecord
} from '../shared/types'

interface RecentApi {
  record: (pluginName: string) => Promise<void>
  getRecent: (limit?: number) => Promise<RecentUsageRecord[]>
  getFrequent: (limit?: number) => Promise<RecentUsageRecord[]>
}

interface PluginConfigApi {
  get: (pluginName: string, key: string) => Promise<string | null>
  set: (pluginName: string, key: string, value: string) => Promise<void>
  getAll: (pluginName: string) => Promise<PluginConfigRecord[]>
  delete: (pluginName: string, key: string) => Promise<void>
}

interface DialogApi {
  openFile: (options?: {
    filters?: { name: string; extensions: string[] }[]
  }) => Promise<string | null>
  saveFile: (options?: { defaultPath?: string }) => Promise<string | null>
}

interface FsApi {
  readFile: (path: string) => Promise<string | null>
  writeFile: (path: string, content: string) => Promise<boolean>
}

interface HttpApi {
  fetch: (
    url: string,
    options?: { method?: string; headers?: Record<string, string>; body?: string }
  ) => Promise<{ ok: boolean; status: number; data: unknown }>
}

interface WindowApi {
  toggleTop: (pinned?: boolean) => Promise<boolean>
}

interface DataApi {
  export: () => Promise<any>
  import: (data: unknown, mode: 'merge' | 'overwrite') => Promise<any>
}

interface ExtendedDbApi extends DbApi {
  recent: RecentApi
  pluginConfig: PluginConfigApi
}

interface ExtendedPluginSystemApi extends PluginSystemApi {
  dialog: DialogApi
  fs: FsApi
  http: HttpApi
  window: WindowApi
  data: DataApi
}

declare global {
  interface Window {
    db: ExtendedDbApi
    pluginSystem: ExtendedPluginSystemApi
    system: SystemApi
  }
}
