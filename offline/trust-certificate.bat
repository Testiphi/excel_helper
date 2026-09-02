@echo off
rem Trust the localhost certificate (UAC prompt will appear once)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -Verb RunAs powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0trust-certificate.ps1\"'"
