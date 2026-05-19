#!/bin/bash
source ~/venv-localdrop/bin/activate
cd ~/Localdrop/backend
python3 main.py &
cd ~/Localdrop/airdrop
npm run tauri dev