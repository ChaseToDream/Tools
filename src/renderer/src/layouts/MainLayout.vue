<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': collapsed }">
    <TopBar class="main-layout__topbar" />
    <Sidebar class="main-layout__sidebar" :collapsed="collapsed" @toggle="handleToggle" />
    <main class="main-layout__content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TopBar from '../components/TopBar.vue'
import Sidebar from '../components/Sidebar.vue'

/** 侧边栏是否折叠 */
const collapsed = ref(false)

/**
 * 切换侧边栏折叠状态
 * 同时将状态持久化到 SQLite
 */
async function handleToggle(): Promise<void> {
  collapsed.value = !collapsed.value
  try {
    await window.db.config.set('sidebarCollapsed', String(collapsed.value))
  } catch (err) {
    console.error('[MainLayout] 持久化侧边栏状态失败:', err)
  }
}

/**
 * 从 SQLite 恢复侧边栏折叠状态
 */
onMounted(async () => {
  try {
    const saved = await window.db.config.get('sidebarCollapsed')
    if (saved === 'true') {
      collapsed.value = true
    }
  } catch (err) {
    console.error('[MainLayout] 读取侧边栏状态失败:', err)
  }
})
</script>

<style scoped>
.main-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  grid-template-areas:
    'topbar topbar'
    'sidebar content';
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-layout.sidebar-collapsed {
  grid-template-columns: 64px 1fr;
}

.main-layout__topbar {
  grid-area: topbar;
}

.main-layout__sidebar {
  grid-area: sidebar;
  overflow: hidden;
}

.main-layout__content {
  grid-area: content;
  overflow-y: auto;
  padding: 24px 28px;
  background-color: var(--el-bg-color-page);
}
</style>
