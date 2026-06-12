AirDrop Locale

Peer-to-peer file transfer on your local network — no internet, no cables, no accounts.

Devices on the same Wi-Fi discover each other automatically. Select a file, pick a device, send. That's it.

Features


Automatic device discovery via local network broadcast
No internet connection required
No account, no cloud, no third-party server
Clean glassmorphism UI built with React + Tauri
Python backend handles discovery and transfer logic



Tech Stack

LayerTechnologyDesktop shellTauri (Rust)FrontendReactBackendPython (with virtualenv)TransportLocal network (LAN)


Supported Platforms

PlatformStatusWindows✅ TestedUbuntu / Linux✅ TestedmacOS⚠️ Not tested — should work, PRs welcome


Installation

For users

Download the installer for your platform from the Releases page:

PlatformFileWindowsAirDrop-Locale_x.x.x_x64.msiUbuntu / Linuxairdrop-locale_x.x.x_amd64.deb

No additional dependencies required — just install and run.


For developers

Requirements:


Node.js (v18+)
Python (v3.10+)
Rust + Cargo
Tauri CLI (cargo install tauri-cli)


bash# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/airdrop-locale.git
cd airdrop-locale

# 2. Set up Python backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Install frontend dependencies
npm install

# 4. Run in development mode
npm run tauri dev

Build:

bashnpm run tauri build

Output binary in src-tauri/target/release/.


How It Works


On launch, the Python backend broadcasts a presence signal on the local network
Other instances of AirDrop Locale on the same network respond and appear in the UI
The sender selects a file and a target device
The file transfers directly between the two machines — no relay, no server



Project Status

Active development. Core transfer functionality is working.
Contributions and issue reports are welcome.


License

MIT
