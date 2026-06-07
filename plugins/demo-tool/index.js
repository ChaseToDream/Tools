/**
 * 示例插件入口 - 导出一个 Vue 组件
 * 渲染进程通过动态 import() 加载此组件
 */
module.exports = {
  name: 'DemoTool',
  template: `
    <div style="padding: 20px;">
      <h2>示例工具</h2>
      <p>这是一个用于测试插件系统的示例工具。</p>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="6"
        placeholder="在此输入文本..."
        style="margin-top: 12px;"
      />
      <el-button type="primary" style="margin-top: 12px;" @click="handleFormat">
        格式化
      </el-button>
      <p v-if="result" style="margin-top: 12px; white-space: pre-wrap;">{{ result }}</p>
    </div>
  `,
  data() {
    return {
      inputText: '',
      result: ''
    }
  },
  methods: {
    /** 简单的文本格式化示例 */
    handleFormat() {
      try {
        const parsed = JSON.parse(this.inputText)
        this.result = JSON.stringify(parsed, null, 2)
      } catch {
        this.result = this.inputText.trim()
      }
    }
  }
}
