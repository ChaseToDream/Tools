<template>
  <el-switch
    :model-value="isDark"
    inline-prompt
    active-text="🌙"
    inactive-text="☀️"
    @change="handleToggle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()

/** 当前是否为暗色主题 */
const isDark = computed(() => themeStore.currentTheme === 'dark')

/** 切换主题 */
function handleToggle(): void {
  themeStore.toggleTheme()
}
</script>
