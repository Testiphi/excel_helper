# Excel Cross-Locator

An Excel task pane add-in that locates and edits cells via **2D anchor search** — designed for tables with multi-level headers, merged cells, or no regular header structure. No header detection needed: enter any two pieces of text to anchor a **row** and a **column**, and their intersection is your target cell.

Excel 任务窗格插件：通过**二维锚点搜索**快速定位并编辑单元格。专为多级表头、合并单元格、无规整表头的表格设计——不依赖表头结构，输入任意两个文本分别锚定"行"与"列"，交叉点即目标单元格。

## How it works / 工作原理

- **Row search**: text → all rows containing it (merged regions expand to their full span)
- **Column search**: text → all columns containing it
- **Intersection**: matched rows × matched columns → target cell grid (Excel coordinates), double-click / Enter to edit and write back
- **Multiple conditions** with AND/OR to narrow down (e.g. duplicate column names under repeated headers)
- 行搜索：文本 → 命中该文本的所有行（合并区域自动扩展至整个跨度）
- 列搜索：文本 → 命中该文本的所有列
- 交叉定位：匹配行 × 匹配列 → 目标单元格网格（Excel 1-based 坐标），双击/Enter 编辑写回
- 多条件"且/或"组合收窄（如重复表头下的同名列）

## Install / 安装（3 steps）

> **Requirements**: Excel desktop (Microsoft 365 or 2021+) or Excel on the web. The add-in only reads/writes the active worksheet; all data stays in your browser's sandbox.
>
> **环境要求**：Excel 桌面版（Microsoft 365 或 2021+）或 Excel 网页版。插件只读写当前活动工作表，数据不出浏览器。

1. **Download the manifest** / 下载清单文件:
   `https://Testiphi.github.io/excel_helper/manifest.xml`
   (Save it as `manifest.xml` anywhere on your computer. / 保存到本地任意位置)
2. **Upload it to Excel** / 在 Excel 中上传:
   - Desktop: `Insert → Add-ins → My Add-ins → Upload My Add-in` → select `manifest.xml`
   - 桌面版：`插入 → 加载项 → 我的加载项 → 上传我的加载项` → 选择 manifest.xml
   - Web: `Insert → Add-ins → Upload My Add-in`（网页版：插入 → 加载项 → 上传我的加载项）
3. **Use it** / 使用:
   - Ribbon `Home → Locator → Open Locator` (or the "Cross-Locator" group), enter text in Row/Column search.
   - 功能区 `开始 → Locator → Open Locator`，在行/列搜索中输入文本即可定位。
   - Language toggle (中文/English) is in the task pane header. / 语言切换按钮在面板顶部。

## Privacy / 隐私

The task pane is a static page in your browser sandbox. It reads the active worksheet's used range and merged regions, and writes back only the cells you edit. **No data is uploaded anywhere.** 任务窗格是浏览器沙箱内的静态页面，只读取当前工作表的已用区域与合并区域，写回你编辑的单元格；**不向任何服务器上传数据**。

## Develop / 开发

```bash
npm install
npm start        # dev server + sideload to Excel
npm run build    # production build → dist/
```

Structure / 结构:

```
src/
  types/      domain types
  services/   excelService (Office.js) / filterEngine (pure locating logic)
  hooks/      data loading & search state
  components/ search panels, result grid, cell editor, etc.
  i18n.tsx    zh/en translations
```

Deployment: pushing to `main` auto-builds and deploys `dist/` to GitHub Pages (`.github/workflows/deploy-pages.yml`). 推送 main 分支自动构建并部署到 GitHub Pages。

## License / 许可

MIT — see [LICENSE](LICENSE).
