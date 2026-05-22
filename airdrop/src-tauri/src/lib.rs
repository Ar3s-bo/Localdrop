use std::process::Command;
use std::thread;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    thread::spawn(|| {
        #[cfg(target_os = "windows")]
        Command::new("cmd")
            .args(["/C", "E:\\venv-localdrop\\Scripts\\python.exe E:\\AIRDROP--APP\\backend\\main.py"])
            .spawn()
            .expect("failed to start backend");

        #[cfg(target_os = "linux")]
        Command::new("sh")
            .args(["-c", "/home/sad/venv-localdrop/bin/python3 /home/sad/Localdrop/backend/main.py"])
            .spawn()
            .expect("failed to start backend");
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}