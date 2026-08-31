@echo off
chcp 65001 >nul
rem 打开 Excel（带交叉定位工具）
rem 双击运行，或固定到任务栏 / 发送到桌面快捷方式
rem 流程：确保本地服务已就绪（未运行则启动并等待端口就绪）→ 打开 Excel

netstat -ano | findstr /c:"LISTENING" | findstr /c:":3000 " >nul
if not errorlevel 1 goto ready

echo 正在启动定位工具服务...
start "" /min cmd /c ""E:\hzz\work\excel_helper\excel-locator-addin\auto-start-addin.bat""
for /l %%i in (1,1,60) do (
  timeout /t 1 /nobreak >nul
  netstat -ano | findstr /c:"LISTENING" | findstr /c:":3000 " >nul
  if not errorlevel 1 goto ready
)
echo 服务启动超时（60 秒），请检查任务栏中的最小化窗口

:ready
start "" excel
exit /b
