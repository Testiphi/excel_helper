@echo off
rem Excel 交叉定位 - 本地服务脚本
rem 由计划任务在 Excel 启动事件触发；亦可手动双击运行
rem 首次以最小化窗口重新启动自身，避免弹出控制台大窗
if not "%1"=="started" (
  start "" /min cmd /c "%~f0" started
  exit /b
)
cd /d "E:\hzz\work\excel_helper\excel-locator-addin"
rem 若 3000 端口已有服务在监听，直接退出
netstat -ano | findstr /c:"LISTENING" | findstr /c:":3000 " >nul
if not errorlevel 1 exit /b
npm run dev-server
