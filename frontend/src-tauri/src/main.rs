// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    image::Image,
    menu::{
        AboutMetadata, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItem,
        PredefinedMenuItem, SubmenuBuilder,
    },
    Emitter, Manager,
};
use tauri::tray::TrayIconBuilder;
use tauri_plugin_opener::OpenerExt;

mod commands;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Sentinel.", name)
}

/// Sync menu checkbox states with frontend panel visibility state
#[tauri::command]
fn sync_menu_state(
    app: tauri::AppHandle,
    left_panel_visible: bool,
    right_panel_visible: bool,
) -> Result<(), String> {
    if let Some(menu) = app.menu() {
        if let Some(item) = menu.get("toggle_left_panel") {
            if let Some(check_item) = item.as_check_menuitem() {
                check_item.set_checked(left_panel_visible).ok();
            }
        }
        if let Some(item) = menu.get("toggle_right_panel") {
            if let Some(check_item) = item.as_check_menuitem() {
                check_item.set_checked(right_panel_visible).ok();
            }
        }
    }
    Ok(())
}

fn create_menu(app: &tauri::App) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    // About metadata for About dialog
    let about_metadata = AboutMetadata {
        name: Some("Sentinel".to_string()),
        version: Some(env!("CARGO_PKG_VERSION").to_string()),
        short_version: Some("0.27".to_string()),
        authors: Some(vec!["Navam".to_string()]),
        comments: Some("Visual-first AI agent testing and evaluation platform".to_string()),
        copyright: Some("© 2025 Navam. All rights reserved.".to_string()),
        license: Some("BSL 1.1".to_string()),
        website: Some("https://navam.io".to_string()),
        website_label: Some("Navam Website".to_string()),
        credits: Some("Built with Tauri, React, and FastAPI".to_string()),
        icon: Image::from_bytes(include_bytes!("../icons/128x128.png")).ok(),
    };

    // =====================
    // macOS App Menu
    // =====================
    #[cfg(target_os = "macos")]
    let app_menu = SubmenuBuilder::new(app, "Sentinel")
        .about(Some(about_metadata.clone()))
        .separator()
        .item(&MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    // =====================
    // File Menu
    // =====================
    #[cfg(target_os = "macos")]
    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&MenuItem::with_id(app, "new_test", "New Test", true, Some("CmdOrCtrl+N"))?)
        .item(&MenuItem::with_id(app, "open", "Open...", true, Some("CmdOrCtrl+O"))?)
        .separator()
        .item(&MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?)
        .item(&MenuItem::with_id(app, "save_as", "Save As...", true, Some("CmdOrCtrl+Shift+S"))?)
        .separator()
        .item(&MenuItem::with_id(app, "export_yaml", "Export to YAML...", true, Some("CmdOrCtrl+E"))?)
        .item(&MenuItem::with_id(app, "import_yaml", "Import from YAML...", true, Some("CmdOrCtrl+Shift+I"))?)
        .build()?;

    #[cfg(not(target_os = "macos"))]
    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&MenuItem::with_id(app, "new_test", "New Test", true, Some("CmdOrCtrl+N"))?)
        .item(&MenuItem::with_id(app, "open", "Open...", true, Some("CmdOrCtrl+O"))?)
        .separator()
        .item(&MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?)
        .item(&MenuItem::with_id(app, "save_as", "Save As...", true, Some("CmdOrCtrl+Shift+S"))?)
        .separator()
        .item(&MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?)
        .separator()
        .item(&MenuItem::with_id(app, "export_yaml", "Export to YAML...", true, Some("CmdOrCtrl+E"))?)
        .item(&MenuItem::with_id(app, "import_yaml", "Import from YAML...", true, Some("CmdOrCtrl+Shift+I"))?)
        .separator()
        .item(&PredefinedMenuItem::quit(app, Some("Exit"))?)
        .build()?;

    // =====================
    // Edit Menu (using predefined items for standard behavior)
    // =====================
    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .separator()
        .select_all()
        .build()?;

    // =====================
    // View Menu with Panel Toggles
    // =====================

    // Panel visibility check items (synced with frontend state)
    let left_panel = CheckMenuItemBuilder::new("Left Panel")
        .id("toggle_left_panel")
        .checked(true)
        .accelerator("CmdOrCtrl+1")
        .build(app)?;

    let right_panel = CheckMenuItemBuilder::new("Right Panel")
        .id("toggle_right_panel")
        .checked(true)
        .accelerator("CmdOrCtrl+2")
        .build(app)?;

    // Panels submenu
    let panels_submenu = SubmenuBuilder::new(app, "Panels")
        .item(&left_panel)
        .item(&right_panel)
        .build()?;

    // View menu with all options
    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&panels_submenu)
        .separator()
        .item(&MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+Plus"))?)
        .item(&MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+Minus"))?)
        .item(&MenuItem::with_id(app, "reset_zoom", "Reset Zoom", true, Some("CmdOrCtrl+0"))?)
        .separator()
        .item(&MenuItem::with_id(app, "fit_canvas", "Fit Canvas", true, Some("CmdOrCtrl+Alt+F"))?)
        .item(&MenuItem::with_id(app, "toggle_minimap", "Toggle Minimap", true, Some("CmdOrCtrl+M"))?)
        .build()?;

    // =====================
    // Window Menu (macOS only)
    // =====================
    #[cfg(target_os = "macos")]
    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .item(&PredefinedMenuItem::maximize(app, Some("Zoom"))?)
        .separator()
        .fullscreen()
        .separator()
        .item(&MenuItem::with_id(app, "bring_all_to_front", "Bring All to Front", true, None::<&str>)?)
        .build()?;

    // =====================
    // Help Menu
    // =====================
    #[cfg(target_os = "macos")]
    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&MenuItem::with_id(app, "documentation", "Sentinel Documentation", true, Some("F1"))?)
        .item(&MenuItem::with_id(app, "keyboard_shortcuts", "Keyboard Shortcuts", true, Some("CmdOrCtrl+/"))?)
        .separator()
        .item(&MenuItem::with_id(app, "report_issue", "Report Issue...", true, None::<&str>)?)
        .item(&MenuItem::with_id(app, "check_updates", "Check for Updates...", true, None::<&str>)?)
        .build()?;

    #[cfg(not(target_os = "macos"))]
    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&MenuItem::with_id(app, "documentation", "Sentinel Documentation", true, Some("F1"))?)
        .item(&MenuItem::with_id(app, "keyboard_shortcuts", "Keyboard Shortcuts", true, Some("CmdOrCtrl+/"))?)
        .separator()
        .about(Some(about_metadata))
        .separator()
        .item(&MenuItem::with_id(app, "report_issue", "Report Issue...", true, None::<&str>)?)
        .item(&MenuItem::with_id(app, "check_updates", "Check for Updates...", true, None::<&str>)?)
        .build()?;

    // =====================
    // Build Complete Menu Bar
    // =====================
    #[cfg(target_os = "macos")]
    let menu = MenuBuilder::new(app)
        .item(&app_menu)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&window_menu)
        .item(&help_menu)
        .build()?;

    #[cfg(not(target_os = "macos"))]
    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&help_menu)
        .build()?;

    Ok(menu)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_project_root,
            sync_menu_state
        ])
        .setup(|app| {
            // Create and set application menu
            let menu = create_menu(app)?;
            app.set_menu(menu)?;

            // Create system tray with app icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Sentinel - AI Agent Testing Platform")
                .build(app)?;

            // Register menu event handler
            app.on_menu_event(move |app_handle, event| {
                let window = app_handle.get_webview_window("main");

                match event.id().0.as_str() {
                    // Settings
                    "settings" => {
                        if let Some(w) = window {
                            w.emit("menu:settings", ()).ok();
                        }
                    }
                    // File operations
                    "new_test" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "new").ok();
                        }
                    }
                    "open" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "open").ok();
                        }
                    }
                    "save" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "save").ok();
                        }
                    }
                    "save_as" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "save-as").ok();
                        }
                    }
                    "export_yaml" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "export").ok();
                        }
                    }
                    "import_yaml" => {
                        if let Some(w) = window {
                            w.emit("menu:file", "import").ok();
                        }
                    }
                    // Panel toggles
                    "toggle_left_panel" => {
                        if let Some(w) = window {
                            w.emit("menu:toggle-panel", "left").ok();
                        }
                    }
                    "toggle_right_panel" => {
                        if let Some(w) = window {
                            w.emit("menu:toggle-panel", "right").ok();
                        }
                    }
                    // View/zoom operations
                    "zoom_in" => {
                        if let Some(w) = window {
                            w.emit("menu:zoom", "in").ok();
                        }
                    }
                    "zoom_out" => {
                        if let Some(w) = window {
                            w.emit("menu:zoom", "out").ok();
                        }
                    }
                    "reset_zoom" => {
                        if let Some(w) = window {
                            w.emit("menu:zoom", "reset").ok();
                        }
                    }
                    "fit_canvas" => {
                        if let Some(w) = window {
                            w.emit("menu:canvas", "fit").ok();
                        }
                    }
                    "toggle_minimap" => {
                        if let Some(w) = window {
                            w.emit("menu:canvas", "toggle-minimap").ok();
                        }
                    }
                    // Help operations
                    "documentation" => {
                        if let Some(w) = window {
                            w.emit("menu:help", "docs").ok();
                        }
                    }
                    "keyboard_shortcuts" => {
                        if let Some(w) = window {
                            w.emit("menu:help", "shortcuts").ok();
                        }
                    }
                    "report_issue" => {
                        // Open GitHub issues page using opener plugin
                        let _ = app_handle
                            .opener()
                            .open_url("https://github.com/navam/sentinel/issues", None::<&str>);
                    }
                    "check_updates" => {
                        if let Some(w) = window {
                            w.emit("menu:help", "check-updates").ok();
                        }
                    }
                    _ => {}
                }
            });

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
