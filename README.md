# Tools

一款基于 Electron + Vue 3 的桌面工具箱应用，通过插件系统扩展功能，支持本地插件和 npm 插件。

## 功能特性

- **插件系统**：支持本地插件和 npm 插件安装、卸载、启用/禁用管理
- **数据存储**：SQLite 数据库存储配置、插件信息、收藏、使用记录
- **主题切换**：支持亮色/暗色主题外观
- **数据管理**：支持导入导出用户数据（收藏、配置、使用记录）
- **系统集成**：剪贴板操作、系统通知、外部链接打开
- **分类管理**：工具按分类和子分类组织，支持筛选浏览

## 技术栈

- **前端**：Vue 3 + TypeScript + Element Plus + Pinia
- **后端**：Electron 33 + better-sqlite3
- **构建工具**：electron-vite + Vite
- **测试框架**：Vitest
- **代码规范**：ESLint + Prettier

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建当前平台
npm run build

# 构建 Windows 安装包
npm run build:win
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch
```

## 项目结构

```
Tools/
├── plugins/                    # 本地插件目录
│   └── demo-tool/             # 示例插件
├── resources/                  # 应用资源文件
├── sdk/                       # 插件开发 SDK
├── src/
│   ├── main/                  # 主进程代码
│   │   ├── database/          # 数据库相关
│   │   │   ├── repositories/  # 数据仓库层
│   │   │   ├── database.ts    # 数据库连接管理
│   │   │   ├── ipc.ts         # 数据库 IPC handlers
│   │   │   └── migration.ts   # 数据库迁移
│   │   ├── plugin/            # 插件系统
│   │   │   ├── ipc-handlers/  # 插件 IPC handlers
│   │   │   ├── context.ts     # 插件上下文
│   │   │   ├── lifecycle.ts   # 插件生命周期
│   │   │   ├── registry.ts    # 插件注册表
│   │   │   └── scanner.ts     # 插件扫描器
│   │   ├── index.ts           # 主进程入口
│   │   ├── tray.ts            # 系统托盘
│   │   └── window.ts          # 窗口管理
│   ├── renderer/              # 渲染进程代码
│   │   └── src/
│   │       ├── components/    # Vue 组件
│   │       ├── layouts/       # 布局组件
│   │       ├── router/        # 路由配置
│   │       ├── stores/        # Pinia 状态管理
│   │       ├── styles/        # 全局样式
│   │       └── views/         # 页面视图
│   ├── shared/                # 共享类型定义
│   └── test/                  # 测试工具
├── electron.vite.config.ts    # Electron Vite 配置
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
└── vitest.config.ts           # Vitest 配置
```

## 插件开发

### 插件结构

每个插件包含以下文件：

```
plugin-name/
├── plugin.json    # 插件清单文件
├── index.js       # 插件入口文件
└── package.json   # npm 插件需要（可选）
```

### plugin.json 示例

```json
{
  "name": "my-tool",
  "version": "1.0.0",
  "title": "我的工具",
  "description": "这是一个自定义工具",
  "category": "开发工具",
  "subCategory": "格式化",
  "icon": "Tools",
  "main": "index.js"
}
```

### 插件入口文件示例

```javascript
module.exports = {
  name: 'MyTool',
  template: `
    <div style="padding: 20px;">
      <h2>{{ title }}</h2>
      <el-input v-model="input" placeholder="输入内容" />
      <el-button @click="process">处理</el-button>
      <p v-if="result">{{ result }}</p>
    </div>
  `,
  data() {
    return {
      title: '我的工具',
      input: '',
      result: ''
    }
  },
  methods: {
    process() {
      this.result = this.input.toUpperCase()
    }
  }
}
```

### 插件上下文 API

插件可以通过 `context` 属性访问以下系统能力：

- `context.storage` - 插件专属键值存储
- `context.clipboard` - 系统剪贴板操作
- `context.notification` - 系统通知
- `context.shell` - 外部链接打开
- `context.fs` - 文件读写
- `context.dialog` - 文件对话框
- `context.http` - HTTP 请求
- `context.config` - 插件配置读写

## 数据库结构

应用使用 SQLite 数据库，包含以下表：

- `config` - 用户配置键值对
- `plugins` - 插件安装记录
- `favorites` - 工具收藏
- `recent_usage` - 插件使用记录
- `plugin_config` - 插件配置存储

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建应用 |
| `npm run build:win` | 构建 Windows 安装包 |
| `npm run preview` | 预览构建结果 |
| `npm test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run lint` | 代码检查和格式化 |

## 许可证

MIT License
