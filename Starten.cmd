@echo off
cd /d "%~dp0"
if exist "%~dp0.tools\node-v24.21.0-win-x64\node.exe" set "PATH=%~dp0.tools\node-v24.21.0-win-x64;%PATH%"
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Bitte zuerst Node.js 24 LTS installieren.
  pause
  exit /b 1
)
if not exist node_modules\vite\bin\vite.js (
  call npm.cmd ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Die angezeigte lokale Adresse im Browser oeffnen.
call npm.cmd run dev
pause
