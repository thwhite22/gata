@echo off
rem Puts a "Rosaphone" shortcut with its own icon on the desktop.
powershell -NoProfile -Command ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Rosaphone.lnk');" ^
  "$s.TargetPath='%~dp0Rosaphone.bat';" ^
  "$s.WorkingDirectory='%~dp0';" ^
  "$s.IconLocation='%~dp0rosaphone.ico';" ^
  "$s.Description='Rosaphone - Rosie''s music machine';" ^
  "$s.Save()"
echo Done - look for Rosaphone on the desktop.
pause
