@echo off
rem Opens the tap-only sound-check page (test speakers, volume and the
rem microphone on this device - no eye gaze needed).
set "APP=%~dp0soundcheck.html"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" ( start "Rosaphone sound check" "%EDGE%" --no-first-run "%APP%" & exit /b )
start "Rosaphone sound check" "%APP%"
