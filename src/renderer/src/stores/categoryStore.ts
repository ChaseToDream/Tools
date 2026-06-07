import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PluginInfo, CategoryNode, FavoriteRecord } from '../../../shared/types'
import { buildCategoryTreeFromPlugins } from '../utils/category'

/**
 * 分类系统 Pinia Store
 * 管理插件的分类树构建、选中状态和过滤逻辑
 */
export const useCategoryStore = defineStore('category', () => {
  /** 分类树数据 */
  const categoryTree = ref<CategoryNode[]>([])

  /** 当前选中的大类名称 */
  const activeCategory = ref<string | null>(null)

  /** 当前选中的子分类名称 */
  const activeSubCategory = ref<string | null>(null)

  /** 所有已加载的插件列表（缓存） */
  const allPlugins = ref<PluginInfo[]>([])

  /** 收藏的插件名称集合 */
  const favoriteNames = ref<Set<string>>(new Set())

  /** 最近使用的插件列表 */
  const recentPlugins = ref<PluginInfo[]>([])

  /** 常用工具插件列表 */
  const frequentPlugins = ref<PluginInfo[]>([])

  /** 当前选中的大类节点 */
  const activeCategoryNode = computed<CategoryNode | undefined>(() => {
    if (!activeCategory.value) return undefined
    return categoryTree.value.find((n) => n.name === activeCategory.value)
  })

  /**
   * 从插件列表构建分类树
   * 同时处理收藏数据，将收藏插件归入"收藏"特殊分类
   */
  function buildCategoryTree(): void {
    categoryTree.value = buildCategoryTreeFromPlugins(
      allPlugins.value,
      favoriteNames.value,
      recentPlugins.value,
      frequentPlugins.value
    )
  }

  /**
   * 选中某个大类
   * @param name - 分类名称，传 null 表示取消选中
   */
  function selectCategory(name: string | null): void {
    activeCategory.value = name
    // 切换大类时重置子分类选中
    activeSubCategory.value = null
  }

  /**
   * 选中某个子分类
   * @param name - 子分类名称，传 null 表示选中整个大类
   */
  function selectSubCategory(name: string | null): void {
    activeSubCategory.value = name
  }

  /**
   * 获取当前筛选条件下的插件列表
   * 根据选中的大类和子分类进行过滤
   * @returns 过滤后的插件列表
   */
  function getFilteredPlugins(): PluginInfo[] {
    // 未选中任何分类时返回全部插件
    if (!activeCategory.value) {
      return allPlugins.value
    }

    const node = activeCategoryNode.value
    if (!node) {
      return allPlugins.value
    }

    // 选中了大类但未选中子分类，返回大类下所有插件（含子分类）
    if (!activeSubCategory.value) {
      const result = [...node.plugins]
      for (const child of node.children) {
        result.push(...child.plugins)
      }
      return result
    }

    // 选中了子分类，只返回该子分类的插件
    const subNode = node.children.find((c) => c.name === activeSubCategory.value)
    return subNode?.plugins ?? []
  }

  /**
   * 判断指定插件是否已收藏
   * @param pluginName - 插件名称
   * @returns 是否已收藏
   */
  function isFavorite(pluginName: string): boolean {
    return favoriteNames.value.has(pluginName)
  }

  /**
   * 切换插件的收藏状态
   * 已收藏则取消，未收藏则添加，同步更新数据库和分类树
   * @param pluginName - 插件名称
   */
  async function toggleFavorite(pluginName: string): Promise<void> {
    try {
      if (favoriteNames.value.has(pluginName)) {
        await window.db.favorite.remove(pluginName)
        favoriteNames.value.delete(pluginName)
      } else {
        await window.db.favorite.add(pluginName)
        favoriteNames.value.add(pluginName)
      }
      // 触发响应式更新：重新赋值 Set
      favoriteNames.value = new Set(favoriteNames.value)
      buildCategoryTree()
    } catch (err) {
      console.error('[categoryStore] 切换收藏状态失败:', err)
    }
  }

  /**
   * 刷新分类数据
   * 重新从 pluginSystem 和 favorites 获取数据并重建分类树
   */
  async function refreshCategories(): Promise<void> {
    try {
      const [plugins, favorites, recentRecords, frequentRecords] = await Promise.all([
        window.pluginSystem.getAll(),
        window.db.favorite.getAll(),
        window.db.recent.getRecent(20),
        window.db.recent.getFrequent(10)
      ])

      allPlugins.value = plugins
      favoriteNames.value = new Set(favorites.map((f: FavoriteRecord) => f.plugin_name))

      // 将最近使用记录映射为 PluginInfo 列表
      recentPlugins.value = recentRecords
        .map((r: { plugin_name: string }) =>
          plugins.find((p: PluginInfo) => p.manifest.name === r.plugin_name)
        )
        .filter((p: PluginInfo | undefined): p is PluginInfo => p !== undefined)

      // 将常用工具记录映射为 PluginInfo 列表
      frequentPlugins.value = frequentRecords
        .map((r: { plugin_name: string }) =>
          plugins.find((p: PluginInfo) => p.manifest.name === r.plugin_name)
        )
        .filter((p: PluginInfo | undefined): p is PluginInfo => p !== undefined)

      buildCategoryTree()
    } catch (err) {
      console.error('[categoryStore] 刷新分类数据失败:', err)
    }
  }

  /**
   * 初始化分类 Store
   * 首次加载时调用，获取插件和收藏数据并构建分类树
   */
  async function initialize(): Promise<void> {
    await refreshCategories()
  }

  return {
    categoryTree,
    activeCategory,
    activeSubCategory,
    allPlugins,
    favoriteNames,
    recentPlugins,
    frequentPlugins,
    activeCategoryNode,
    buildCategoryTree,
    selectCategory,
    selectSubCategory,
    getFilteredPlugins,
    isFavorite,
    toggleFavorite,
    refreshCategories,
    initialize
  }
})
