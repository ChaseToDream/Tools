<template>
  <el-tooltip :content="isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
    <el-button text class="theme-toggle" @click="handleToggle">
      <el-icon :size="18" class="theme-toggle__icon">
        <Sunny v-if="!isDark" />
        <Moon v-else />
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/themeStore'
import { Sunny, Moon } from '@element-plus/icons-vue'

const themeStore = useThemeStore()

/** 当前是否为暗色主题 */
const isDark = computed(() => themeStore.currentTheme === 'dark')

/** 切换主题 */
function handleToggle(): void {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--el-text-color-secondary);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  color: var(--el-color-warning);
  background-color: var(--el-fill-color-light);
}

.theme-toggle__icon {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover .theme-toggle__icon {
  transform: rotate(30deg);
}
</style>
