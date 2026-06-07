<template>
  <div class="home-page">
    <div class="home-page__header">
      <div class="home-page__header-left">
        <h2 class="home-page__title">{{ pageTitle }}</h2>
        <el-tag size="small" round effect="plain" type="info">
          {{ filteredPlugins.length }} 个工具
        </el-tag>
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <div v-if="filteredPlugins.length > 0" class="home-page__grid">
      <ToolCard v-for="plugin in filteredPlugins" :key="plugin.manifest.name" :plugin="plugin" />
    </div>

    <!-- 空状态 -->
    <div v-else class="home-page__empty">
      <el-empty description="暂无工具">
        <template #image>
          <el-icon :size="64" color="var(--el-text-color-placeholder)"><FolderOpened /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'
import ToolCard from '../components/ToolCard.vue'
import { FolderOpened } from '@element-plus/icons-vue'

const categoryStore = useCategoryStore()

/** 当前筛选后的插件列表 */
const filteredPlugins = computed(() => categoryStore.getFilteredPlugins())

/**
 * 页面标题：根据当前选中分类动态生成
 */
const pageTitle = computed(() => {
  if (categoryStore.activeSubCategory) {
    return categoryStore.activeSubCategory
  }
  if (categoryStore.activeCategory) {
    return categoryStore.activeCategory
  }
  return '全部工具'
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
}

.home-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.home-page__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-page__title {
  color: var(--el-text-color-primary);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.home-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.home-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
