@echo off
cd E:\AIRDROP--APP\backend
call E:\venv-localdrop\Scripts\activate
start python main.py
cd E:\AIRDROP--APP\airdrop
npm run tauri dev