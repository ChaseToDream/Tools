<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Logo 区域 -->
    <el-tooltip content="Tools" placement="right" :disabled="!collapsed">
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">
          <el-icon :size="20"><Box /></el-icon>
        </div>
        <span v-show="!collapsed" class="sidebar__logo-text">Tools</span>
      </div>
    </el-tooltip>

    <!-- 分类导航菜单 -->
    <el-menu
      :default-active="activeMenuKey"
      :collapse="collapsed"
      :collapse-transition="true"
      class="sidebar__menu"
      @select="handleMenuSelect"
    >
      <!-- 全部工具 -->
      <el-tooltip content="全部工具" placement="right" :disabled="!collapsed">
        <el-menu-item index="__all__">
          <el-icon><Grid /></el-icon>
          <template #title>全部工具</template>
        </el-menu-item>
      </el-tooltip>

      <!-- 收藏分类 -->
      <el-tooltip v-if="hasFavorites" content="收藏" placement="right" :disabled="!collapsed">
        <el-menu-item index="收藏">
          <el-icon><Star /></el-icon>
          <template #title>收藏</template>
        </el-menu-item>
      </el-tooltip>

      <!-- 最近使用分类 -->
      <el-tooltip v-if="hasRecent" content="最近使用" placement="right" :disabled="!collapsed">
        <el-menu-item index="最近使用">
          <el-icon><Clock /></el-icon>
          <template #title>最近使用</template>
        </el-menu-item>
      </el-tooltip>

      <!-- 常用工具分类 -->
      <el-tooltip v-if="hasFrequent" content="常用工具" placement="right" :disabled="!collapsed">
        <el-menu-item index="常用工具">
          <el-icon><TrendCharts /></el-icon>
          <template #title>常用工具</template>
        </el-menu-item>
      </el-tooltip>

      <!-- 普通分类：有子分类用 sub-menu，无子分类用 menu-item -->
      <template v-for="node in categoryTree" :key="node.name">
        <!-- 有子分类的大类 -->
        <el-sub-menu v-if="node.children.length > 0" :index="node.name">
          <template #title>
            <el-icon><Folder /></el-icon>
            <span>{{ node.name }}</span>
          </template>
          <el-menu-item
            v-for="child in node.children"
            :key="child.name"
            :index="`${node.name}::${child.name}`"
          >
            {{ child.name }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子分类的大类 -->
        <el-menu-item v-else :index="node.name">
          <el-icon><Folder /></el-icon>
          <template #title>{{ node.name }}</template>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 底部折叠按钮 -->
    <div class="sidebar__footer">
      <el-tooltip :content="collapsed ? '展开侧边栏' : '折叠侧边栏'" placement="right">
        <el-button text class="sidebar__collapse-btn" @click="$emit('toggle')">
          <el-icon :size="18">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'
import { FAVORITE_CATEGORY, RECENT_CATEGORY, FREQUENT_CATEGORY } from '../utils/category'
import { Box, Grid, Star, Folder, Fold, Expand, Clock, TrendCharts } from '@element-plus/icons-vue'

defineProps<{
  /** 侧边栏是否折叠 */
  collapsed: boolean
}>()

defineEmits<{
  /** 折叠/展开切换事件 */
  (e: 'toggle'): void
}>()

const categoryStore = useCategoryStore()

/** 是否存在收藏分类 */
const hasFavorites = computed(() =>
  categoryStore.categoryTree.some((n) => n.name === FAVORITE_CATEGORY)
)

/** 是否存在最近使用分类 */
const hasRecent = computed(() => categoryStore.categoryTree.some((n) => n.name === RECENT_CATEGORY))

/** 是否存在常用工具分类 */
const hasFrequent = computed(() =>
  categoryStore.categoryTree.some((n) => n.name === FREQUENT_CATEGORY)
)

/** 排除收藏、最近使用、常用工具分类后的分类树（这些分类单独渲染） */
const categoryTree = computed(() =>
  categoryStore.categoryTree.filter(
    (n) =>
      n.name !== FAVORITE_CATEGORY && n.name !== RECENT_CATEGORY && n.name !== FREQUENT_CATEGORY
  )
)

/**
 * 计算当前菜单高亮的 key
 * 规则：未选中分类时高亮"全部工具"，否则高亮对应分类或子分类
 */
const activeMenuKey = computed(() => {
  if (!categoryStore.activeCategory) {
    return '__all__'
  }
  if (categoryStore.activeSubCategory) {
    return `${categoryStore.activeCategory}::${categoryStore.activeSubCategory}`
  }
  return categoryStore.activeCategory
})

/**
 * 处理菜单选中事件
 * 根据选中项的 index 判断是"全部"、"大类"还是"子分类"
 * @param index - 菜单项的 index 值
 */
function handleMenuSelect(index: string): void {
  if (index === '__all__') {
    categoryStore.selectCategory(null)
    return
  }

  if (index.includes('::')) {
    // 子分类格式：大类名::子分类名
    const [category, subCategory] = index.split('::')
    categoryStore.selectCategory(category)
    categoryStore.selectSubCategory(subCategory)
  } else {
    // 大类
    categoryStore.selectCategory(index)
    categoryStore.selectSubCategory(null)
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
  transition: padding 0.3s ease;
}

.sidebar__logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  color: #fff;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.sidebar__logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: -0.3px;
}

.sidebar--collapsed .sidebar__logo {
  justify-content: center;
  padding: 0;
}

.sidebar--collapsed .sidebar__logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.sidebar__menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;
  --el-menu-bg-color: var(--el-bg-color);
  padding: 8px 0;
}

/* 菜单项全局样式 */
.sidebar__menu :deep(.el-menu-item) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: 40px;
  line-height: 40px;
}

.sidebar__menu :deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light);
}

.sidebar__menu :deep(.el-menu-item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  font-weight: 600;
}

/* 子菜单标题样式 */
.sidebar__menu :deep(.el-sub-menu__title) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sidebar__menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--el-fill-color-light);
}

/* 子菜单内的菜单项多一层缩进 */
.sidebar__menu :deep(.el-sub-menu .el-menu-item) {
  margin: 0 8px 0 16px;
  min-width: 0;
}

/* 折叠时隐藏菜单文字溢出 */
.sidebar__menu:not(.el-menu--collapse) {
  width: 240px;
}

/* 折叠状态下菜单项居中 */
.sidebar__menu.el-menu--collapse :deep(.el-menu-item) {
  justify-content: center;
  margin: 2px 12px;
}

.sidebar__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.sidebar__collapse-btn {
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);
  transition: all 0.2s ease;
  border-radius: 0;
}

.sidebar__collapse-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}
</style>
