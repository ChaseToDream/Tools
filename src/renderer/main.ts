import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './src/router'
import App from './App.vue'
import './src/styles/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useThemeStore } from './src/stores/themeStore'
import { useCategoryStore } from './src/stores/categoryStore'

/** 创建 Pinia 实例（必须在 use store 之前创建） */
const pinia = createPinia()

/** 创建 Vue 应用实例并挂载插件和根组件 */
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

/**
 * 应用启动后初始化主题和分类数据
 * 主题从 SQLite 读取偏好并应用到 DOM
 * 分类数据从插件系统加载并构建分类树
 */
const themeStore = useThemeStore()
const categoryStore = useCategoryStore()

themeStore.initTheme()
categoryStore.initialize()
