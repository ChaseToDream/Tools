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

html.dark .main-layout {
  background-color: #020617;
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
  position: relative;
}

/* 暗色主题下内容区域添加网格背景 */
html.dark .main-layout__content {
  background-color: #020617;
  background-image:
    linear-gradient(rgba(var(--tech-accent-rgb), 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--tech-accent-rgb), 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* 内容区域左侧渐变遮罩（与侧边栏衔接） */
html.dark .main-layout__content::before {
  content: '';
  position: fixed;
  top: 56px;
  left: 0;
  width: 240px;
  height: calc(100vh - 56px);
  background: linear-gradient(90deg, var(--tech-glass-bg), transparent);
  pointer-events: none;
  z-index: 1;
}

.main-layout.sidebar-collapsed .main-layout__content::before {
  width: 64px;
}

/* 内容区域顶部渐变遮罩 */
html.dark .main-layout__content::after {
  content: '';
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: block;
  pointer-events: none;
  background: linear-gradient(180deg, #020617, transparent);
  margin: -24px -28px 0 -28px;
  z-index: 0;
}

.main-layout__content > * {
  position: relative;
  z-index: 1;
}
</style>
