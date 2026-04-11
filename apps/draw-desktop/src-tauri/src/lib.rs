//! Rashamon Draw Desktop — Tauri 2 application entry point.
//!
//! This module sets up the Tauri app with:
//! - Frontend shell (React + Vite)
//! - Tauri commands for document operations
//! - Rust core integration

use rashamon_core::Document;
use tauri::Manager;

/// Tauri command: create a new document.
#[tauri::command]
fn create_document(title: &str) -> Result<String, String> {
    let doc = Document::new(title);
    doc.to_json().map_err(|e| e.to_string())
}

/// Tauri command: validate a document JSON string.
#[tauri::command]
fn validate_document(json: &str) -> Result<Vec<String>, String> {
    let doc = Document::from_json(json).map_err(|e| e.to_string())?;
    match doc.validate() {
        Ok(()) => Ok(Vec::new()),
        Err(e) => Ok(vec![e.to_string()]),
    }
}

/// Tauri command: get application version.
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Tauri command: get core library info.
#[tauri::command]
fn get_core_info() -> serde_json::Value {
    serde_json::json!({
        "name": "rashamon_core",
        "version": env!("CARGO_PKG_VERSION"),
        "features": ["document", "scene_graph", "transform", "geometry"]
    })
}

/// Run the Tauri application.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            create_document,
            validate_document,
            get_app_version,
            get_core_info,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Rashamon Draw");
}
