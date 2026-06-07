<template>
  <el-card class="tool-card" shadow="hover" @click="handleCardClick">
    <!-- 图标区域 -->
    <div class="tool-card__icon">
      <el-icon :size="32">
        <component :is="iconComponent" />
      </el-icon>
    </div>

    <!-- 工具信息 -->
    <div class="tool-card__info">
      <span class="tool-card__title">{{ plugin.manifest.title }}</span>
      <span class="tool-card__desc">{{ plugin.manifest.description }}</span>
    </div>

    <!-- 收藏按钮 -->
    <el-button
      class="tool-card__fav"
      :class="{ 'tool-card__fav--active': favorited }"
      text
      size="small"
      @click.stop="handleToggleFavorite"
    >
      <el-icon :size="18">
        <StarFilled v-if="favorited" />
        <Star v-else />
      </el-icon>
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoryStore } from '../stores/categoryStore'
import type { PluginInfo } from '../../../shared/types'
import { Star, StarFilled } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps<{
  /** 插件信息 */
  plugin: PluginInfo
}>()

const router = useRouter()
const categoryStore = useCategoryStore()

/** 当前插件是否已收藏 */
const favorited = computed(() => categoryStore.isFavorite(props.plugin.manifest.name))

/**
 * 根据 manifest.icon 字段解析 Element Plus 图标组件
 * 未指定或找不到时回退到 Box 图标
 */
const iconComponent = computed(() => {
  const iconName = props.plugin.manifest.icon
  if (iconName && (ElementPlusIconsVue as Record<string, unknown>)[iconName]) {
    return (ElementPlusIconsVue as Record<string, unknown>)[iconName]
  }
  return ElementPlusIconsVue.Box
})

/**
 * 点击卡片主体区域，跳转到工具运行页
 */
function handleCardClick(): void {
  router.push({ name: 'ToolRunner', params: { name: props.plugin.manifest.name } })
}

/**
 * 点击收藏按钮，切换收藏状态（不触发卡片跳转）
 */
function handleToggleFavorite(): void {
  categoryStore.toggleFavorite(props.plugin.manifest.name)
}
</script>

<style scoped>
.tool-card {
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.tool-card:active {
  transform: translateY(-2px);
}

.tool-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px 20px;
}

.tool-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-7),
    var(--el-color-primary-light-9)
  );
  color: var(--el-color-primary);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-card__icon {
  transform: scale(1.08);
}

.tool-card__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  width: 100%;
  overflow: hidden;
}

.tool-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.tool-card__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.tool-card__fav {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--el-text-color-placeholder);
  background-color: var(--el-bg-color);
  transition: all 0.25s ease;
  opacity: 0;
  transform: scale(0.8);
}

.tool-card:hover .tool-card__fav {
  opacity: 1;
  transform: scale(1);
}

.tool-card__fav--active {
  opacity: 1 !important;
  transform: scale(1) !important;
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
}

.tool-card__fav:hover {
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-8);
  transform: scale(1.1) !important;
}
</style>
