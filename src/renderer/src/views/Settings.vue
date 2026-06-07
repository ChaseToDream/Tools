<template>
  <div class="settings-page">
    <h2 class="settings-page__title">设置</h2>

    <el-tabs v-model="activeTab" class="settings-page__tabs">
      <!-- Tab 1: 通用设置 -->
      <el-tab-pane label="通用" name="general">
        <div class="settings-section">
          <!-- 主题切换 -->
          <div class="settings-row">
            <div class="settings-row__label">
              <span>主题模式</span>
              <span class="settings-row__desc">切换亮色或暗色外观</span>
            </div>
            <el-radio-group :model-value="themeStore.currentTheme" @change="handleThemeChange">
              <el-radio-button value="light">亮色</el-radio-button>
              <el-radio-button value="dark">暗色</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 语言设置 -->
          <div class="settings-row">
            <div class="settings-row__label">
              <span>语言</span>
              <span class="settings-row__desc">选择界面显示语言</span>
            </div>
            <el-select
              :model-value="settingsStore.settings.language || 'zh-CN'"
              style="width: 160px"
              @change="(val: string) => settingsStore.updateSetting('language', val)"
            >
              <el-option label="中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </div>

          <!-- 插件目录路径 -->
          <div class="settings-row">
            <div class="settings-row__label">
              <span>插件目录</span>
              <span class="settings-row__desc">本地插件存放位置</span>
            </div>
            <el-input :model-value="pluginDir" readonly style="max-width: 400px" />
          </div>

          <!-- 开机自启动 -->
          <div class="settings-row">
            <div class="settings-row__label">
              <span>开机自启动</span>
              <span class="settings-row__desc">系统启动时自动运行应用</span>
            </div>
            <el-switch
              :model-value="settingsStore.settings.autoStart === 'true'"
              @change="(val: boolean) => settingsStore.updateSetting('autoStart', String(val))"
            />
          </div>

          <!-- 关闭时最小化到托盘 -->
          <div class="settings-row">
            <div class="settings-row__label">
              <span>关闭时最小化到托盘</span>
              <span class="settings-row__desc">关闭窗口后保持在系统托盘</span>
            </div>
            <el-switch
              :model-value="settingsStore.settings.minimizeToTray !== 'false'"
              @change="(val: boolean) => settingsStore.updateSetting('minimizeToTray', String(val))"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 插件管理 -->
      <el-tab-pane label="插件管理" name="plugins">
        <div class="settings-section">
          <!-- 操作栏 -->
          <div class="plugin-toolbar">
            <el-button
              :icon="Refresh"
              :loading="settingsStore.refreshing"
              @click="settingsStore.refreshPlugins()"
            >
              刷新插件
            </el-button>
          </div>

          <!-- 已安装插件列表 -->
          <el-table
            :data="settingsStore.plugins"
            stripe
            style="width: 100%"
            empty-text="暂无已安装插件"
          >
            <el-table-column prop="manifest.title" label="名称" min-width="140" />
            <el-table-column prop="manifest.version" label="版本" width="80" />
            <el-table-column prop="manifest.category" label="分类" width="100" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag
                  :type="
                    row.status === 'loaded' ? 'success' : row.status === 'error' ? 'danger' : 'info'
                  "
                  size="small"
                >
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="来源" width="80">
              <template #default="{ row }">
                {{
                  row.manifest.name.startsWith('@') || row.manifest.name.includes('/')
                    ? 'npm'
                    : 'local'
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.status !== 'disabled'"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  style="margin-right: 8px"
                  @change="(val: boolean) => handleTogglePlugin(row.manifest.name, val)"
                />
                <el-button
                  v-if="row.manifest.config && row.manifest.config.length > 0"
                  size="small"
                  text
                  @click="handleConfig(row)"
                  >配置</el-button
                >
                <el-popconfirm
                  title="确定要卸载此插件吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="handleUninstall(row.manifest.name)"
                >
                  <template #reference>
                    <el-button type="danger" size="small" text>卸载</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <!-- 安装新插件 -->
          <div class="plugin-install">
            <h4 class="plugin-install__title">安装新插件</h4>
            <div class="plugin-install__form">
              <el-input
                v-model="npmPackage"
                placeholder="输入 npm 包名，如：toolbox-plugin-hello"
                :disabled="settingsStore.installing"
                style="max-width: 360px"
                @keyup.enter="handleInstall"
              />
              <el-button
                type="primary"
                :loading="settingsStore.installing"
                :disabled="!npmPackage.trim()"
                @click="handleInstall"
              >
                安装
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 关于 -->
      <el-tab-pane label="关于" name="about">
        <div class="settings-section about-section">
          <div class="about-card">
            <h3 class="about-card__name">ToolBox</h3>
            <span class="about-card__version">v0.1.0</span>
            <el-divider />
            <div class="about-card__info">
              <p>一款基于 Electron 的桌面工具箱应用。</p>
              <p>通过插件系统扩展功能，支持本地插件和 npm 插件。</p>
            </div>
            <el-divider />
            <div class="about-card__stack">
              <h4>技术栈</h4>
              <el-tag v-for="tech in techStack" :key="tech" size="small" class="about-card__tag">
                {{ tech }}
              </el-tag>
            </div>
            <el-divider />
            <p class="about-card__license">开源许可：MIT License</p>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 4: 数据管理 -->
      <el-tab-pane label="数据管理" name="data">
        <div class="settings-section">
          <div class="settings-row">
            <div class="settings-row__label">
              <span>导出数据</span>
              <span class="settings-row__desc">将收藏、配置、使用记录导出为 JSON 文件</span>
            </div>
            <el-button @click="handleExport">导出</el-button>
          </div>
          <div class="settings-row">
            <div class="settings-row__label">
              <span>导入数据</span>
              <span class="settings-row__desc">从 JSON 文件恢复数据</span>
            </div>
            <div class="data-import-actions">
              <el-button @click="handleImport('merge')">合并导入</el-button>
              <el-button type="danger" @click="handleImport('overwrite')">覆盖导入</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <PluginConfigDialog
      v-model:visible="configDialogVisible"
      :plugin-name="configPluginName"
      :plugin-title="configPluginTitle"
      :config-items="configPluginItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/themeStore'
import { useSettingsStore } from '../stores/settingsStore'
import PluginConfigDialog from '../components/PluginConfigDialog.vue'
import type { PluginStatus, PluginConfigItem } from '../../../shared/types'

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

/** 当前激活的 Tab 名称 */
const activeTab = ref('general')

/** npm 包名输入 */
const npmPackage = ref('')

/** 插件目录路径（从配置读取，默认提示） */
const pluginDir = ref('')

/** 技术栈标签列表 */
const techStack = ['Electron', 'Vue 3', 'TypeScript', 'Element Plus', 'Pinia', 'SQLite']

/** 配置对话框可见性 */
const configDialogVisible = ref(false)
/** 当前配置的插件名称 */
const configPluginName = ref('')
/** 当前配置的插件标题 */
const configPluginTitle = ref('')
/** 当前配置的插件配置项 */
const configPluginItems = ref<PluginConfigItem[]>([])

/**
 * 将插件状态映射为中文标签
 * @param status - 插件运行状态
 * @returns 状态中文标签
 */
function statusLabel(status: PluginStatus): string {
  const map: Record<PluginStatus, string> = {
    loaded: '已启用',
    disabled: '已禁用',
    error: '异常'
  }
  return map[status] ?? '未知'
}

/**
 * 处理主题切换
 * @param theme - 目标主题值
 */
async function handleThemeChange(theme: string): Promise<void> {
  await themeStore.setTheme(theme as 'light' | 'dark')
}

/**
 * 处理插件启用/禁用切换
 * @param name - 插件名称
 * @param enabled - 是否启用
 */
async function handleTogglePlugin(name: string, enabled: boolean): Promise<void> {
  try {
    await settingsStore.togglePlugin(name, enabled)
    ElMessage.success(enabled ? '插件已启用' : '插件已禁用')
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

/**
 * 处理插件卸载
 * @param name - 插件名称
 */
async function handleUninstall(name: string): Promise<void> {
  try {
    await settingsStore.uninstallPlugin(name)
    ElMessage.success('插件已卸载')
  } catch {
    ElMessage.error('卸载失败，请重试')
  }
}

/**
 * 处理 npm 插件安装
 */
async function handleInstall(): Promise<void> {
  const pkg = npmPackage.value.trim()
  if (!pkg) return

  try {
    await settingsStore.installPlugin(pkg)
    ElMessage.success(`插件 ${pkg} 安装成功`)
    npmPackage.value = ''
  } catch {
    ElMessage.error(`插件 ${pkg} 安装失败，请检查包名是否正确`)
  }
}

/**
 * 打开插件配置对话框
 * @param plugin - 插件信息
 */
function handleConfig(plugin: {
  manifest: { name: string; title: string; config?: PluginConfigItem[] }
}): void {
  configPluginName.value = plugin.manifest.name
  configPluginTitle.value = plugin.manifest.title
  configPluginItems.value = plugin.manifest.config ?? []
  configDialogVisible.value = true
}

/**
 * 导出数据为 JSON 文件
 */
async function handleExport(): Promise<void> {
  try {
    const data = await window.pluginSystem.data.export()
    if (!data) {
      ElMessage.error('导出失败')
      return
    }
    const json = JSON.stringify(data, null, 2)
    const path = await window.pluginSystem.dialog.saveFile({ defaultPath: 'toolbox-backup.json' })
    if (path) {
      const success = await window.pluginSystem.fs.writeFile(path, json)
      if (success) {
        ElMessage.success('数据已导出')
      } else {
        ElMessage.error('写入文件失败')
      }
    }
  } catch {
    ElMessage.error('导出失败')
  }
}

/**
 * 导入数据
 * @param mode - 导入模式：merge 合并 / overwrite 覆盖
 */
async function handleImport(mode: 'merge' | 'overwrite'): Promise<void> {
  try {
    const path = await window.pluginSystem.dialog.openFile({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!path) return

    const content = await window.pluginSystem.fs.readFile(path)
    if (!content) {
      ElMessage.error('读取文件失败')
      return
    }

    const data = JSON.parse(content)
    const result = await window.pluginSystem.data.import(data, mode)
    if (result?.success) {
      ElMessage.success(mode === 'overwrite' ? '数据已覆盖导入' : '数据已合并导入')
    } else {
      ElMessage.error('导入失败：' + (result?.error ?? '未知错误'))
    }
  } catch {
    ElMessage.error('导入失败，请检查文件格式')
  }
}

/**
 * 页面挂载时初始化设置数据
 */
onMounted(async () => {
  await settingsStore.initialize()
  // 从配置中读取插件目录路径
  pluginDir.value = settingsStore.settings.pluginDir || './plugins'
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  padding: 4px 0;
}

.settings-page__title {
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.settings-page__tabs {
  --el-tabs-header-height: 44px;
}

.settings-page__tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

/* 通用设置行 */
.settings-section {
  padding: 4px 0;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  margin-bottom: 4px;
  background-color: var(--el-bg-color);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  transition: border-color 0.2s ease;
}

.settings-row:hover {
  border-color: var(--el-border-color-light);
}

.settings-row__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-row__label > span:first-child {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.settings-row__desc {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* 插件管理 */
.plugin-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.plugin-install {
  margin-top: 24px;
  padding: 20px 24px;
  background-color: var(--el-bg-color);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
}

.plugin-install__title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}

.plugin-install__form {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 关于页面 */
.about-section {
  display: flex;
  justify-content: center;
}

.about-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  padding: 40px 32px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.about-card__name {
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.about-card__version {
  display: inline-block;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 500;
  background-color: var(--el-color-primary-light-9);
  padding: 2px 12px;
  border-radius: 12px;
}

.about-card__info {
  text-align: left;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 2;
}

.about-card__stack {
  text-align: left;
}

.about-card__stack h4 {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.about-card__tag {
  margin: 0 6px 6px 0;
}

.about-card__license {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

/* 数据管理 */
.data-import-actions {
  display: flex;
  gap: 8px;
}

/* 设置分区标题 */
.settings-section h4 {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
