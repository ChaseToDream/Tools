import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PluginInfo } from '../../../shared/types'
import { useCategoryStore } from './categoryStore'

/**
 * 设置页面 Pinia Store
 * 管理通用配置项和插件安装/卸载/启禁用等操作
 */
export const useSettingsStore = defineStore('settings', () => {
  /** 从 SQLite 加载的所有配置键值对 */
  const settings = ref<Record<string, string>>({})

  /** 已安装插件列表 */
  const plugins = ref<PluginInfo[]>([])

  /** 插件安装中标记 */
  const installing = ref(false)

  /** 插件刷新中标记 */
  const refreshing = ref(false)

  /**
   * 从 SQLite 加载所有配置项
   */
  async function loadSettings(): Promise<void> {
    try {
      settings.value = await window.db.config.getAll()
    } catch (err) {
      console.error('[settingsStore] 加载配置失败:', err)
    }
  }

  /**
   * 更新单个配置项并立即持久化到 SQLite
   * @param key - 配置键名
   * @param value - 配置值
   */
  async function updateSetting(key: string, value: string): Promise<void> {
    settings.value[key] = value
    try {
      await window.db.config.set(key, value)
    } catch (err) {
      console.error('[settingsStore] 持久化配置失败:', err)
    }
  }

  /**
   * 从插件系统加载已安装插件列表
   */
  async function loadPlugins(): Promise<void> {
    try {
      plugins.value = await window.pluginSystem.getAll()
    } catch (err) {
      console.error('[settingsStore] 加载插件列表失败:', err)
    }
  }

  /**
   * 安装 npm 插件
   * 安装完成后刷新插件列表和分类数据
   * @param packageName - npm 包名
   */
  async function installPlugin(packageName: string): Promise<void> {
    installing.value = true
    try {
      await window.pluginSystem.install(packageName)
      await loadPlugins()
      const categoryStore = useCategoryStore()
      await categoryStore.refreshCategories()
    } catch (err) {
      console.error('[settingsStore] 安装插件失败:', err)
      throw err
    } finally {
      installing.value = false
    }
  }

  /**
   * 卸载插件
   * 卸载完成后刷新插件列表和分类数据
   * @param name - 插件名称
   */
  async function uninstallPlugin(name: string): Promise<void> {
    try {
      await window.pluginSystem.uninstall(name)
      await loadPlugins()
      const categoryStore = useCategoryStore()
      await categoryStore.refreshCategories()
    } catch (err) {
      console.error('[settingsStore] 卸载插件失败:', err)
      throw err
    }
  }

  /**
   * 启用或禁用插件
   * 操作完成后刷新插件列表和分类数据
   * @param name - 插件名称
   * @param enabled - true 启用，false 禁用
   */
  async function togglePlugin(name: string, enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await window.pluginSystem.enable(name)
      } else {
        await window.pluginSystem.disable(name)
      }
      await loadPlugins()
      const categoryStore = useCategoryStore()
      await categoryStore.refreshCategories()
    } catch (err) {
      console.error('[settingsStore] 切换插件状态失败:', err)
      throw err
    }
  }

  /**
   * 刷新插件列表（重新扫描插件目录）
   */
  async function refreshPlugins(): Promise<void> {
    refreshing.value = true
    try {
      await window.pluginSystem.scan()
      await loadPlugins()
      const categoryStore = useCategoryStore()
      await categoryStore.refreshCategories()
    } catch (err) {
      console.error('[settingsStore] 刷新插件失败:', err)
    } finally {
      refreshing.value = false
    }
  }

  /**
   * 初始化设置 Store
   * 加载配置和插件列表
   */
  async function initialize(): Promise<void> {
    await Promise.all([loadSettings(), loadPlugins()])
  }

  return {
    settings,
    plugins,
    installing,
    refreshing,
    loadSettings,
    updateSetting,
    loadPlugins,
    installPlugin,
    uninstallPlugin,
    togglePlugin,
    refreshPlugins,
    initialize
  }
})
