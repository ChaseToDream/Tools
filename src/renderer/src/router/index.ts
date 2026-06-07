import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

/**
 * 创建路由实例
 * 使用 Hash 模式以兼容 Electron 的 file:// 协议
 * 嵌套路由结构：MainLayout 包含 Home / ToolRunner / Settings
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'tool/:name',
          name: 'ToolRunner',
          component: () => import('@/views/ToolRunner.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
    }
  ]
})

export default router
