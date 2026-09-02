# Excel Cross-Locator

> [中文版 README](README.zh-CN.md) | 中文说明

An Excel task pane add-in that locates and edits cells via **2D anchor search** — designed for tables with multi-level headers, merged cells, or no regular header structure. No header detection needed: enter any two pieces of text to anchor a **row** and a **column**, and their intersection is your target cell.

## Download / Install

Two ways to use it:

### Option A: Offline package (recommended, fully local)

Download `Excel-Cross-Locator-offline.zip` from the [latest release](https://github.com/Testiphi/excel_helper/releases/latest). No Node.js required.

1. Unzip anywhere, then **right-click `Trust-Certificate.bat` → Run as administrator** (once per machine, UAC prompt appears)
2. Double-click `Start-Server.bat` (keep the minimized window open while using Excel)
3. In Excel: `Insert → Add-ins → My Add-ins → Upload My Add-in` → select the `manifest.xml` in the unzipped folder
4. Use: ribbon `Home → Locator → Open Locator`

### Option B: Hosted version (no local server)

Download the hosted [manifest.xml](https://Testiphi.github.io/excel_helper/manifest.xml), then upload it in Excel as in step 3 above.

## How it works

- **Row search**: text → all rows containing it (merged regions expand to their full span)
- **Column search**: text → all columns containing it
- **Intersection**: matched rows × matched columns → target cell grid (Excel 1-based coordinates); double-click / Enter to edit and write back
- **Multiple conditions** with AND/OR to narrow down (e.g. duplicate column names under repeated headers)
- **Language toggle** (中文/English) is in the task pane header

## Requirements

- Excel desktop (Microsoft 365 or 2021+) or Excel on the web
- The add-in only reads the active worksheet; all data stays in your browser's sandbox — **nothing is uploaded anywhere**

## Develop

```bash
npm install
npm start        # dev server + sideload to Excel
npm run build    # production build → dist/
```

Structure:

```
src/
  types/      domain types
  services/   excelService (Office.js) / filterEngine (pure locating logic)
  hooks/      data loading & search state
  components/ search panels, result grid, cell editor, etc.
  i18n.tsx    zh/en translations
offline/      offline package sources (server.ps1, launchers, build script)
```

To rebuild the offline zip: `powershell -File offline/build-offline.ps1`.

## License

MIT — see [LICENSE](LICENSE).
