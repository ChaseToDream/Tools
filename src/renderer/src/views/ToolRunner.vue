<template>
  <div class="tool-runner">
    <!-- 顶部栏：返回按钮 + 插件名称 -->
    <div class="tool-runner__header">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <span class="tool-runner__name">{{ pluginName }}</span>
    </div>

    <!-- 加载中：骨架屏 -->
    <div v-if="pluginStore.pluginLoading" class="tool-runner__loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 加载失败：错误提示 -->
    <el-result
      v-else-if="pluginStore.pluginError"
      icon="error"
      title="加载失败"
      :sub-title="pluginStore.pluginError"
    >
      <template #extra>
        <el-button type="primary" @click="retryLoad">重试</el-button>
      </template>
    </el-result>

    <!-- 插件运行区域 -->
    <div v-else-if="pluginStore.pluginComponent" class="tool-runner__content">
      <component
        :is="pluginStore.pluginComponent"
        :context="pluginContext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePluginStore } from '../stores/pluginStore'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()

/** 当前插件名称（从路由参数获取） */
const pluginName = computed(() => String(route.params.name ?? ''))

/** 为当前插件创建 PluginContext */
const pluginContext = computed(() =>
  pluginStore.currentPlugin
    ? pluginStore.createPluginContext(pluginStore.currentPlugin.manifest.name)
    : null
)

/**
 * 返回上一页
 */
function goBack(): void {
  router.back()
}

/**
 * 重新加载当前插件
 */
function retryLoad(): void {
  if (pluginName.value) {
    pluginStore.loadPlugin(pluginName.value)
  }
}

/**
 * 组件挂载时加载插件
 */
onMounted(() => {
  if (pluginName.value) {
    pluginStore.loadPlugin(pluginName.value)
  }
})

/**
 * 组件卸载时清理插件状态
 */
onUnmounted(() => {
  pluginStore.unloadPlugin()
})
</script>

<style scoped>
.tool-runner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-runner__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.tool-runner__name {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.tool-runner__loading {
  padding: 20px;
}

.tool-runner__content {
  flex: 1;
  overflow-y: auto;
}
</style>
