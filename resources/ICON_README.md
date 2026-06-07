# 应用图标说明

本目录存放 Tools 应用的图标资源。

## 所需文件

| 文件 | 用途 | 尺寸要求 |
|------|------|----------|
| icon.ico | Windows 应用图标（electron-builder 使用） | 至少包含 256x256 |
| icon.png | 备选 PNG 图标 | 256x256 |
| icon.svg | 矢量源文件（已提供） | - |

## 如何生成 icon.ico

1. 使用 `icon.svg` 作为源文件
2. 推荐工具：
   - **在线**: https://cloudconvert.com/svg-to-ico 或 https://convertio.co/zh/svg-ico/
   - **本地**: ImageMagick `convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
   - **本地**: Inkscape + GIMP 手动导出
3. 生成后将 `icon.ico` 放入本目录
4. 在 `package.json` 的 `build.win` 中添加 `"icon": "resources/icon.ico"`

## 当前状态

- [x] icon.svg 已提供
- [ ] icon.ico 待生成（构建时使用默认图标）
- [ ] icon.png 待生成
