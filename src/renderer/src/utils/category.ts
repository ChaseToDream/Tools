import type { PluginInfo, CategoryNode } from '../../../shared/types'

/** "收藏"特殊分类名称 */
export const FAVORITE_CATEGORY = '收藏'

/** "最近使用"特殊分类名称 */
export const RECENT_CATEGORY = '最近使用'

/** "常用工具"特殊分类名称 */
export const FREQUENT_CATEGORY = '常用工具'

/** "其他"默认分类名称（无 category 的插件归入此类） */
export const OTHER_CATEGORY = '其他'

/**
 * 按拼音对字符串进行排序的比较函数
 * @param a - 第一个字符串
 * @param b - 第二个字符串
 * @returns 排序比较结果
 */
function compareByPinyin(a: string, b: string): number {
  return a.localeCompare(b, 'zh-CN')
}

/**
 * 从插件列表构建分类树
 * 遍历所有插件按 category/subCategory 分组，生成排序后的分类树结构
 * @param plugins - 插件信息列表
 * @param favoritePluginNames - 收藏的插件名称集合
 * @returns 排序后的分类树（"收藏"在最前，"其他"在最后）
 */
export function buildCategoryTreeFromPlugins(
  plugins: PluginInfo[],
  favoritePluginNames: Set<string>,
  recentPlugins: PluginInfo[] = [],
  frequentPlugins: PluginInfo[] = []
): CategoryNode[] {
  const categoryMap = new Map<string, Map<string, PluginInfo[]>>()
  const rootPluginsMap = new Map<string, PluginInfo[]>()
  const otherPlugins: PluginInfo[] = []

  for (const plugin of plugins) {
    const category = plugin.manifest.category?.trim()
    const subCategory = plugin.manifest.subCategory?.trim()

    // 无分类的插件归入"其他"
    if (!category) {
      otherPlugins.push(plugin)
      continue
    }

    // 确保大类存在
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map())
      rootPluginsMap.set(category, [])
    }

    if (subCategory) {
      // 有子分类的插件放入子分类
      const subMap = categoryMap.get(category)!
      if (!subMap.has(subCategory)) {
        subMap.set(subCategory, [])
      }
      subMap.get(subCategory)!.push(plugin)
    } else {
      // 无子分类的插件直接挂在大类下
      rootPluginsMap.get(category)!.push(plugin)
    }
  }

  // 构建分类节点
  const nodes: CategoryNode[] = []

  // 构建"收藏"特殊分类
  const favoritePlugins = plugins.filter((p) => favoritePluginNames.has(p.manifest.name))
  if (favoritePlugins.length > 0) {
    nodes.push({
      name: FAVORITE_CATEGORY,
      children: [],
      plugins: favoritePlugins
    })
  }

  // 构建"最近使用"特殊分类
  if (recentPlugins.length > 0) {
    nodes.push({
      name: RECENT_CATEGORY,
      children: [],
      plugins: recentPlugins
    })
  }

  // 构建"常用工具"特殊分类
  if (frequentPlugins.length > 0) {
    nodes.push({
      name: FREQUENT_CATEGORY,
      children: [],
      plugins: frequentPlugins
    })
  }

  // 构建普通分类节点
  const entries = Array.from(categoryMap.entries())
  for (const [category, subMap] of entries) {
    const children: CategoryNode[] = []

    const subEntries = Array.from(subMap.entries())
    for (const [subCategory, subPlugins] of subEntries) {
      children.push({
        name: subCategory,
        children: [],
        plugins: subPlugins
      })
    }

    // 子分类按拼音排序
    children.sort((a, b) => compareByPinyin(a.name, b.name))

    nodes.push({
      name: category,
      children,
      plugins: rootPluginsMap.get(category) ?? []
    })
  }

  // 普通分类按拼音排序
  nodes.sort((a, b) => compareByPinyin(a.name, b.name))

  // "其他"分类始终排在最后
  if (otherPlugins.length > 0) {
    nodes.push({
      name: OTHER_CATEGORY,
      children: [],
      plugins: otherPlugins
    })
  }

  // "收藏"始终排在最前
  const favIndex = nodes.findIndex((n) => n.name === FAVORITE_CATEGORY)
  if (favIndex > 0) {
    const [fav] = nodes.splice(favIndex, 1)
    nodes.unshift(fav)
  }

  // "最近使用"排在收藏之后
  const recentIndex = nodes.findIndex((n) => n.name === RECENT_CATEGORY)
  if (recentIndex > 0) {
    const [recent] = nodes.splice(recentIndex, 1)
    const insertPos = nodes.findIndex((n) => n.name === FAVORITE_CATEGORY)
    nodes.splice(insertPos >= 0 ? insertPos + 1 : 0, 0, recent)
  }

  // "常用工具"排在最近使用之后
  const freqIndex = nodes.findIndex((n) => n.name === FREQUENT_CATEGORY)
  if (freqIndex > 0) {
    const [freq] = nodes.splice(freqIndex, 1)
    const insertPos = nodes.findIndex((n) => n.name === RECENT_CATEGORY)
    nodes.splice(insertPos >= 0 ? insertPos + 1 : 0, 0, freq)
  }

  return nodes
}
