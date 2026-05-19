@echo off
start "Backend" cmd /k E:\AIRDROP--APP\start-backend.bat
timeout /t 2
cd /d E:\AIRDROP--APP\airdrop
npm run tauri dev