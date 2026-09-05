@echo off
rem Rosaphone in a normal window (for trying things out; Rosie's day-to-day
rem launcher is Rosaphone.bat, which is full-screen).

set "FLAGS=--autoplay-policy=no-user-gesture-required --use-fake-ui-for-media-stream --no-first-run"
set "APP=%~dp0index.html"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" ( start "Rosaphone" "%EDGE%" %FLAGS% "%APP%" & exit /b )

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" ( start "Rosaphone" "%CHROME%" %FLAGS% "%APP%" & exit /b )

start "Rosaphone" "%APP%"
