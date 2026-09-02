Excel Cross-Locator (Offline Package)
=====================================

A fully local Excel add-in: locate and edit cells by row/column anchor search.
No Node.js required. All data stays on your machine.

Chinese / 中文
=====================================
Excel Cross-Locator 离线插件包：通过行/列锚点搜索定位并编辑单元格。
无需安装 Node.js，所有数据只在本机处理。

Install (Windows) / 安装步骤（Windows）
=====================================
1. Trust the certificate (ONCE per machine):
   right-click Trust-Certificate.bat -> Run as administrator
   (A UAC prompt will appear. Required because Excel add-ins need HTTPS.)
   信任证书（每台机器只需一次）：
   右键 Trust-Certificate.bat -> 以管理员身份运行（会弹出 UAC 确认）

2. Start the local server:
   double-click Start-Server.bat
   (A minimized window will appear - keep it open while using Excel.)
   启动本地服务：
   双击 Start-Server.bat（会弹出最小化窗口，使用 Excel 期间保持运行）

3. Install the add-in in Excel:
   Insert -> Add-ins -> My Add-ins -> Upload My Add-in
   -> select the manifest.xml in this folder
   在 Excel 中安装插件：
   插入 -> 加载项 -> 我的加载项 -> 上传我的加载项 -> 选择本文件夹中的 manifest.xml

4. Use it:
   Ribbon Home -> Locator -> Open Locator.
   Enter text in Row/Column search; the intersection is your target cell.
   Language toggle (中文/English) is at the top of the task pane.
   使用：功能区 开始 -> Locator -> Open Locator。
   在行/列搜索中输入文本即可定位；面板顶部可切换中英文。

Notes / 说明
=====================================
- If the server window closed or Excel shows "can't load" in the task pane:
  double-click Start-Server.bat again, then close and reopen the task pane.
- To remove the add-in: right-click it in My Add-ins -> Remove.
- If you regenerate the certificate (e.g. the server rebuilt it after 2 years),
  run step 1 again.
