<template>
  <el-dialog
    :model-value="visible"
    :title="`${pluginTitle} - 配置`"
    width="480px"
    @update:model-value="$emit('update:visible', $event)"
    @open="loadConfig"
  >
    <el-form v-if="configItems.length > 0" label-width="120px" label-position="left">
      <el-form-item v-for="item in configItems" :key="item.key" :label="item.label">
        <!-- string 类型 -->
        <el-input
          v-if="item.type === 'string'"
          v-model="formData[item.key]"
          :placeholder="String(item.default ?? '')"
        />
        <!-- number 类型 -->
        <el-input-number
          v-else-if="item.type === 'number'"
          v-model="formData[item.key]"
          :placeholder="Number(item.default ?? 0)"
          controls-position="right"
          style="width: 100%"
        />
        <!-- boolean 类型 -->
        <el-switch v-else-if="item.type === 'boolean'" v-model="formData[item.key]" />
      </el-form-item>
    </el-form>
    <el-empty v-else description="此插件无可配置项" />
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { PluginConfigItem } from '../../../shared/types'

const props = defineProps<{
  /** 对话框是否可见 */
  visible: boolean
  /** 插件名称 */
  pluginName: string
  /** 插件标题 */
  pluginTitle: string
  /** 配置项声明列表 */
  configItems: PluginConfigItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

/** 表单数据（key -> value 映射） */
const formData = ref<Record<string, string | number | boolean>>({})

/** 是否正在保存 */
const saving = ref(false)

/**
 * 对话框打开时加载配置值
 */
async function loadConfig(): Promise<void> {
  const data: Record<string, any> = {}
  for (const item of props.configItems) {
    const val = await window.db.pluginConfig.get(props.pluginName, item.key)
    if (val !== null) {
      if (item.type === 'number') {
        data[item.key] = Number(val)
      } else if (item.type === 'boolean') {
        data[item.key] = val === 'true'
      } else {
        data[item.key] = val
      }
    } else {
      data[item.key] =
        item.default ?? (item.type === 'number' ? 0 : item.type === 'boolean' ? false : '')
    }
  }
  formData.value = data
}

/**
 * 保存配置
 */
async function handleSave(): Promise<void> {
  saving.value = true
  try {
    for (const item of props.configItems) {
      const value = String(formData.value[item.key] ?? item.default ?? '')
      await window.db.pluginConfig.set(props.pluginName, item.key, value)
    }
    ElMessage.success('配置已保存')
    emit('update:visible', false)
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>
