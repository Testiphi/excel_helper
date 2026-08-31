# Excel 交叉定位（Excel Locator Add-in）

Excel 任务窗格插件：通过**二维锚点搜索**快速定位并编辑单元格，专为多级表头、合并单元格、无规整表头的表格设计——无需依赖表头结构，输入任意两个文本分别锚定"行"与"列"，交叉点即目标单元格。

## 核心思路

- **行搜索**：输入文本 → 命中该文本的单元格所在行（命中合并区域时扩展至整个跨度）
- **列搜索**：输入文本 → 命中该文本的单元格所在列
- **交叉定位**：匹配行 × 匹配列 → 目标单元格网格（Excel 1-based 坐标），双击/Enter 编辑并写回
- 多条件支持"且/或"组合收窄（如期中/期末双表头下的重复列名）

## 技术栈

- Office Add-in（Taskpane）+ Office.js
- React 18 + TypeScript + Fluent UI v9（webpack 5）

## 目录结构

```
src/
  types/      领域类型定义
  services/   excelService（Office.js 读写）/ filterEngine（纯定位算法）
  hooks/      数据加载与搜索状态管理
  components/ 搜索面板、结果网格、编辑弹层等 UI
```

## 开发运行

```bash
npm install
npm start        # 启动开发服务器并 sideload 到 Excel
```

## 本机常驻（个人使用）

- `open-excel-with-tool.bat`：确保本地服务就绪后打开 Excel（桌面快捷方式入口）
- `auto-start-addin.bat`：本地服务启动脚本（端口 3000，已运行则跳过）
- `create-shortcut.ps1`：重新生成桌面快捷方式

> 注意：以上脚本内含本机绝对路径，仅适用于当前机器。

## 打包部署

`npm run build` 产物在 `dist/`；发布前需将 `webpack.config.js` 中的 `urlProd` 改为真实 HTTPS 托管地址。
