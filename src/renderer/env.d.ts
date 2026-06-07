/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { DbApi, PluginSystemApi, SystemApi } from '../shared/types'

declare global {
  interface Window {
    db: DbApi
    pluginSystem: PluginSystemApi
    system: SystemApi
  }
}
