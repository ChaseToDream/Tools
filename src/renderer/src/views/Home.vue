<template>
  <div class="home-page">
    <h2 class="home-page__title">{{ pageTitle }}</h2>
    <p class="home-page__count">共 {{ filteredPlugins.length }} 个工具</p>

    <!-- 工具卡片网格 -->
    <div v-if="filteredPlugins.length > 0" class="home-page__grid">
      <ToolCard
        v-for="plugin in filteredPlugins"
        :key="plugin.manifest.name"
        :plugin="plugin"
      />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无工具"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'
import ToolCard from '../components/ToolCard.vue'

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
.home-page__title {
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.home-page__count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.home-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
</style>
