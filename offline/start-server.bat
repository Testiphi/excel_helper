@echo off
rem Excel Cross-Locator: start the local HTTPS server (port 3000)
if not "%1"=="started" (
  start "" /min cmd /c "%~f0" started
  exit /b
)
netstat -ano | findstr /c:"LISTENING" | findstr /c:":3000 " >nul
if not errorlevel 1 exit /b
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
