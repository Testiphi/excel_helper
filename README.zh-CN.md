# Excel Cross-Locator（Excel 交叉定位）

> [English README](README.md) | English version

Excel 任务窗格插件：通过**二维锚点搜索**快速定位并编辑单元格。专为多级表头、合并单元格、无规整表头的表格设计——不依赖表头结构，输入任意两个文本分别锚定"行"与"列"，交叉点即目标单元格。

## 下载与安装

两种使用方式：

### 方式 A：离线包（推荐，完全本地）

从[最新 Release](https://github.com/Testiphi/excel_helper/releases/latest) 下载 `Excel-Cross-Locator-offline.zip`。无需安装 Node.js。

1. 解压到任意位置，**右键 `Trust-Certificate.bat` → 以管理员身份运行**（每台机器只需一次，会弹 UAC 确认）
2. 双击 `Start-Server.bat`（使用 Excel 期间保持最小化窗口运行）
3. 在 Excel 中：`插入 → 加载项 → 我的加载项 → 上传我的加载项` → 选择解压文件夹中的 `manifest.xml`
4. 使用：功能区 `开始 → Locator → Open Locator`

### 方式 B：托管版（无需本地服务）

下载托管版 [manifest.xml](https://Testiphi.github.io/excel_helper/manifest.xml)，然后按方式 A 第 3 步在 Excel 中上传即可。

## 工作原理

- **行搜索**：输入文本 → 命中该文本的所有行（合并区域自动扩展至整个跨度）
- **列搜索**：输入文本 → 命中该文本的所有列
- **交叉定位**：匹配行 × 匹配列 → 目标单元格网格（Excel 1-based 坐标），双击/Enter 编辑写回
- **多条件**"且/或"组合收窄（如重复表头下的同名列）
- 面板顶部按钮可切换 **中/英文**

## 环境要求

- Excel 桌面版（Microsoft 365 或 2021+）或 Excel 网页版
- 插件只读写当前活动工作表，数据不出浏览器——**不向任何服务器上传数据**

## 开发

```bash
npm install
npm start        # 开发服务器 + sideload 到 Excel
npm run build    # 生产构建 → dist/
```

目录结构：

```
src/
  types/      领域类型定义
  services/   excelService（Office.js 读写）/ filterEngine（纯定位算法）
  hooks/      数据加载与搜索状态管理
  components/ 搜索面板、结果网格、编辑弹层等
  i18n.tsx    中英文案
offline/      离线包源码（server.ps1、启动/信任脚本、打包脚本）
```

重建离线 zip：`powershell -File offline/build-offline.ps1`。

## 许可

MIT — 见 [LICENSE](LICENSE)。
