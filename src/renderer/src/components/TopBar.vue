<template>
  <div class="topbar">
    <!-- 左侧：面包屑导航 -->
    <el-breadcrumb separator="/" class="topbar__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="categoryStore.activeCategory">
        {{ categoryStore.activeCategory }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="categoryStore.activeSubCategory">
        {{ categoryStore.activeSubCategory }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="toolName">
        {{ toolName }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 中间：全局搜索框 -->
    <div class="topbar__search">
      <el-autocomplete
        ref="searchInputRef"
        v-model="searchText"
        :fetch-suggestions="handleSearch"
        placeholder="搜索工具..."
        :prefix-icon="Search"
        clearable
        size="default"
        class="topbar__search-input"
        @select="handleSelect"
      >
        <!-- 自定义搜索结果项 -->
        <template #default="{ item }">
          <div class="topbar__search-item">
            <span class="topbar__search-item-title">{{ item.title }}</span>
            <span class="topbar__search-item-category">{{ item.category }}</span>
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 右侧：置顶 + 主题切换 + 设置 -->
    <div class="topbar__actions">
      <el-tooltip :content="isPinned ? '取消置顶' : '窗口置顶'" placement="bottom">
        <el-button
          text
          class="topbar__pin-btn"
          :class="{ 'topbar__pin-btn--active': isPinned }"
          @click="togglePin"
        >
          <el-icon :size="18"><Aim /></el-icon>
        </el-button>
      </el-tooltip>
      <ThemeToggle />
      <el-tooltip content="设置" placement="bottom">
        <el-button text class="topbar__settings-btn" @click="goSettings">
          <el-icon :size="18"><Setting /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '../stores/categoryStore'
import ThemeToggle from './ThemeToggle.vue'
import { Search, Setting, Aim } from '@element-plus/icons-vue'

/** 搜索结果项类型（适配 el-autocomplete 的 fetch-suggestions） */
interface SearchSuggestion {
  value: string
  title: string
  category: string
  name: string
}

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()

/** 搜索框文本 */
const searchText = ref('')

/** 窗口是否置顶 */
const isPinned = ref(false)

/**
 * 切换窗口置顶状态
 */
async function togglePin(): Promise<void> {
  isPinned.value = await window.pluginSystem.window.toggleTop()
}

/** 搜索框组件引用（用于快捷键聚焦） */
const searchInputRef = ref<any>(null)

/** 防抖定时器 ID */
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 当前运行工具的名称（仅在 /tool/:name 路由下有值）
 */
const toolName = computed(() => {
  if (route.name === 'ToolRunner' && route.params.name) {
    return String(route.params.name)
  }
  return null
})

/**
 * 防抖搜索处理函数
 * 按 title、description、category 模糊匹配，300ms 防抖
 * @param query - 搜索关键词
 * @param cb - 回调函数，返回搜索结果数组
 */
function handleSearch(query: string, cb: (results: SearchSuggestion[]) => void): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      cb([])
      return
    }

    const plugins = categoryStore.allPlugins
    const results: SearchSuggestion[] = []

    for (const plugin of plugins) {
      const { title, description, category, name } = plugin.manifest
      const match =
        title.toLowerCase().includes(trimmed) ||
        description.toLowerCase().includes(trimmed) ||
        category.toLowerCase().includes(trimmed)

      if (match) {
        results.push({
          value: title,
          title,
          category,
          name
        })
      }
    }

    cb(results)
  }, 300)
}

/**
 * 选中搜索结果项，跳转到对应工具运行页
 * @param item - 选中的搜索结果
 */
function handleSelect(item: Record<string, any>): void {
  const suggestion = item as SearchSuggestion
  router.push({ name: 'ToolRunner', params: { name: suggestion.name } })
  searchText.value = ''
}

/**
 * 跳转到设置页面
 */
function goSettings(): void {
  router.push({ name: 'Settings' })
}

/**
 * 全局快捷键处理：Ctrl+K / Ctrl+F 聚焦搜索框
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'f')) {
    e.preventDefault()
    const inputEl = document.querySelector(
      '.topbar__search-input .el-input__inner'
    ) as HTMLInputElement
    if (inputEl) {
      inputEl.focus()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  gap: 16px;
  -webkit-app-region: drag;
}

.topbar__breadcrumb {
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.topbar__search {
  flex: 1;
  max-width: 420px;
  margin: 0 auto;
  -webkit-app-region: no-drag;
}

.topbar__search-input {
  width: 100%;
}

.topbar__search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  background-color: var(--el-fill-color-light);
  box-shadow: none;
  transition: all 0.25s ease;
}

.topbar__search-input :deep(.el-input__wrapper:hover) {
  background-color: var(--el-fill-color);
}

.topbar__search-input :deep(.el-input__wrapper.is-focus) {
  background-color: var(--el-bg-color);
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.topbar__search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.topbar__search-item-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.topbar__search-item-category {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 12px;
  flex-shrink: 0;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}

.topbar__settings-btn,
.topbar__pin-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--el-text-color-secondary);
  transition: all 0.2s ease;
}

.topbar__settings-btn:hover,
.topbar__pin-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.topbar__pin-btn--active {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.topbar__pin-btn--active:hover {
  background-color: var(--el-color-primary-light-8);
}
</style>
