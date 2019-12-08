@echo off
cd "Background Animations\marcel-bulla.de v2"
call build.bat
cd ..\..\

rd /s /q dist
mkdir dist

xcopy "Background Animations\marcel-bulla.de v2\dist" "dist" /E

xcopy "Toolbox" "dist\js" /E