import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [
      /** zod 是纯 JS 库，需要打包进主进程而非 externalize */
      externalizeDepsPlugin({
        exclude: ['zod']
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      /** 自动导入 Element Plus 组件 */
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      /** 自动导入 Element Plus API（如 ElMessage） */
      AutoImport({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
})
