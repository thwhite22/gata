@echo off
rem Rosaphone - full-screen kiosk launcher for Rosie's eye gaze device.
rem Flags: autoplay allowed (starts with no tap) and the microphone
rem permission auto-accepted (for the Record button).

set "FLAGS=--autoplay-policy=no-user-gesture-required --use-fake-ui-for-media-stream --no-first-run"
set "APP=%~dp0index.html"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "Rosaphone" "%EDGE%" --kiosk "%APP%" --edge-kiosk-type=fullscreen %FLAGS%
  exit /b
)

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "Rosaphone" "%CHROME%" --kiosk "%APP%" %FLAGS%
  exit /b
)

rem No Edge or Chrome found - open with the default browser instead.
start "Rosaphone" "%APP%"
