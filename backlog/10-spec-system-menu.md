# System Menu Specification

**Document Version**: 1.0
**Created**: 2025-11-24
**Target Release**: v0.27.0
**Status**: Planning

## Executive Summary

This specification defines the native system menu implementation for Sentinel desktop application. Key deliverables include:

1. **Customized About Dialog** - Properly branded "About Sentinel" with logo, version, copyright, and license
2. **Settings/Preferences Menu** - Quick access to application settings dialog
3. **View Menu with Panel Toggles** - Submenu for left/right panel visibility control

**Priority**: HIGH - Improves desktop app polish and user experience

## Goals

### Primary Goals

1. **Brand Consistency**: Display "Sentinel" (properly capitalized) in all system menus
2. **Professional About Dialog**: Show app icon, version, description, copyright, and license
3. **Settings Access**: Provide menu-based access to Settings/Preferences dialog
4. **Panel Management**: Allow users to toggle workspace panel visibility from View menu

### Non-Goals

- Custom title bar (future consideration)
- System tray menu (already implemented separately)
- Context menus (separate specification)

## Technical Reference

### Tauri Menu API (v2.9+)

**Key Imports (Rust)**:
```rust
use tauri::{
    image::Image,
    menu::{
        AboutMetadata, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItem,
        PredefinedMenuItem, Submenu, SubmenuBuilder,
    },
    Manager,
};
```

**AboutMetadata Fields**:
| Field | Type | Platform Support |
|-------|------|------------------|
| `name` | `Option<String>` | All |
| `version` | `Option<String>` | All |
| `short_version` | `Option<String>` | All (parenthesized on Win/Linux) |
| `authors` | `Option<Vec<String>>` | Windows/Linux only |
| `comments` | `Option<String>` | Windows/Linux only |
| `copyright` | `Option<String>` | All |
| `license` | `Option<String>` | Windows/Linux only |
| `website` | `Option<String>` | Windows/Linux only |
| `website_label` | `Option<String>` | Windows/Linux only |
| `credits` | `Option<String>` | macOS only |
| `icon` | `Option<Image<'a>>` | macOS/Linux only |

**PredefinedMenuItem Types**:
| Item | Constructor | Platform |
|------|-------------|----------|
| `About` | `about(app, text, metadata)` | All |
| `Quit` | `quit(app, text)` | All |
| `Separator` | `separator(app)` | All |
| `Hide` | `hide(app, text)` | macOS/Windows |
| `HideOthers` | `hide_others(app, text)` | macOS/Windows |
| `ShowAll` | `show_all(app, text)` | macOS |
| `Minimize` | `minimize(app, text)` | macOS/Windows |
| `Maximize` | `maximize(app, text)` | macOS/Windows |
| `CloseWindow` | `close_window(app, text)` | macOS/Windows |
| `Fullscreen` | `fullscreen(app, text)` | macOS |
| `Services` | `services(app, text)` | macOS |

## Menu Structure

### macOS Menu Bar

```
Sentinel (App Menu)
├── About Sentinel                    [Custom AboutMetadata]
├── ─────────────────
├── Settings...                       ⌘, [Opens Settings Dialog]
├── ─────────────────
├── Services                          → [System Services Submenu]
├── ─────────────────
├── Hide Sentinel                     ⌘H
├── Hide Others                       ⌥⌘H
├── Show All
├── ─────────────────
└── Quit Sentinel                     ⌘Q

File
├── New Test                          ⌘N
├── Open...                           ⌘O
├── ─────────────────
├── Save                              ⌘S
├── Save As...                        ⇧⌘S
├── ─────────────────
├── Export to YAML...                 ⌘E
└── Import from YAML...               ⇧⌘I

Edit
├── Undo                              ⌘Z
├── Redo                              ⇧⌘Z
├── ─────────────────
├── Cut                               ⌘X
├── Copy                              ⌘C
├── Paste                             ⌘V
├── ─────────────────
└── Select All                        ⌘A

View
├── Panels                            → [Panel Visibility Submenu]
│   ├── ☑ Left Panel                  ⌘1
│   └── ☑ Right Panel                 ⌘2
├── ─────────────────
├── Zoom In                           ⌘+
├── Zoom Out                          ⌘-
├── Reset Zoom                        ⌘0
├── ─────────────────
├── Fit Canvas                        ⌥⌘F
└── Toggle Minimap                    ⌘M

Window
├── Minimize                          ⌘M
├── Zoom
├── ─────────────────
├── Enter Full Screen                 ⌃⌘F
├── ─────────────────
└── Bring All to Front

Help
├── Sentinel Documentation            F1
├── Keyboard Shortcuts                ⌘/
├── ─────────────────
├── Report Issue...
└── Check for Updates...
```

### Windows/Linux Menu Bar

```
File
├── New Test                          Ctrl+N
├── Open...                           Ctrl+O
├── ─────────────────
├── Save                              Ctrl+S
├── Save As...                        Ctrl+Shift+S
├── ─────────────────
├── Settings...                       Ctrl+, [Opens Settings Dialog]
├── ─────────────────
├── Export to YAML...                 Ctrl+E
├── Import from YAML...               Ctrl+Shift+I
├── ─────────────────
└── Exit                              Alt+F4

Edit
├── Undo                              Ctrl+Z
├── Redo                              Ctrl+Y
├── ─────────────────
├── Cut                               Ctrl+X
├── Copy                              Ctrl+C
├── Paste                             Ctrl+V
├── ─────────────────
└── Select All                        Ctrl+A

View
├── Panels                            → [Panel Visibility Submenu]
│   ├── ☑ Left Panel                  Ctrl+1
│   └── ☑ Right Panel                 Ctrl+2
├── ─────────────────
├── Zoom In                           Ctrl++
├── Zoom Out                          Ctrl+-
├── Reset Zoom                        Ctrl+0
├── ─────────────────
├── Fit Canvas                        Ctrl+Alt+F
└── Toggle Minimap                    Ctrl+M

Help
├── Documentation                     F1
├── Keyboard Shortcuts                Ctrl+/
├── ─────────────────
├── About Sentinel                    [Custom About Dialog]
├── Report Issue...
└── Check for Updates...
```

## Implementation Details

### 1. About Sentinel Dialog

**Rust Implementation** (`frontend/src-tauri/src/main.rs`):

```rust
use tauri::{
    image::Image,
    menu::{AboutMetadata, MenuBuilder, PredefinedMenuItem, SubmenuBuilder},
    Manager,
};

fn create_about_metadata(app: &tauri::AppHandle) -> AboutMetadata<'static> {
    // Load app icon for About dialog (macOS/Linux only)
    let icon = Image::from_bytes(include_bytes!("../icons/128x128.png"))
        .ok()
        .map(|img| img.to_owned());

    AboutMetadata {
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
        icon,
    }
}
```

**About Dialog Content**:
| Field | Value |
|-------|-------|
| Name | Sentinel |
| Version | {CARGO_PKG_VERSION} (e.g., 0.27.0) |
| Short Version | 0.27 |
| Description | Visual-first AI agent testing and evaluation platform |
| Copyright | © 2025 Navam. All rights reserved. |
| License | BSL 1.1 (Apache 2.0 after Oct 2028) |
| Website | https://navam.io |
| Credits (macOS) | Built with Tauri, React, and FastAPI |
| Icon | 128x128.png app icon |

### 2. Settings/Preferences Menu Item

**Event Handling (Rust)**:

```rust
app.on_menu_event(move |app_handle, event| {
    match event.id().0.as_str() {
        "settings" => {
            // Emit event to frontend to open Settings dialog
            if let Some(window) = app_handle.get_webview_window("main") {
                window.emit("menu:settings", ()).ok();
            }
        }
        _ => {}
    }
});
```

**Frontend Event Listener (TypeScript)**:

```typescript
// In App.tsx or a dedicated hook
import { listen } from '@tauri-apps/api/event';
import { useSettingsStore } from './stores/settingsStore';

useEffect(() => {
    const unlisten = listen('menu:settings', () => {
        // Open settings dialog
        useSettingsStore.getState().openSettings();
    });

    return () => {
        unlisten.then(fn => fn());
    };
}, []);
```

### 3. Panel Visibility Toggle Submenu

**Rust Implementation**:

```rust
use tauri::menu::{CheckMenuItemBuilder, SubmenuBuilder};

fn create_view_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, tauri::Error> {
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

    // View menu
    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&panels_submenu)
        .separator()
        .text("zoom_in", "Zoom In")
        .text("zoom_out", "Zoom Out")
        .text("reset_zoom", "Reset Zoom")
        .separator()
        .text("fit_canvas", "Fit Canvas")
        .text("toggle_minimap", "Toggle Minimap")
        .build()?;

    Ok(view_menu)
}
```

**Event Handling for Panel Toggles**:

```rust
app.on_menu_event(move |app_handle, event| {
    let window = app_handle.get_webview_window("main");

    match event.id().0.as_str() {
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
        _ => {}
    }
});
```

**Frontend Panel State Sync**:

```typescript
// useMenuSync.ts hook
import { listen, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useWorkspaceStore } from '../stores/workspaceStore';

export function useMenuSync() {
    const { leftPanelVisible, rightPanelVisible, toggleLeftPanel, toggleRightPanel } = useWorkspaceStore();

    useEffect(() => {
        // Listen for menu panel toggle events
        const unlistenPanel = listen<string>('menu:toggle-panel', (event) => {
            if (event.payload === 'left') {
                toggleLeftPanel();
            } else if (event.payload === 'right') {
                toggleRightPanel();
            }
        });

        return () => {
            unlistenPanel.then(fn => fn());
        };
    }, [toggleLeftPanel, toggleRightPanel]);

    // Sync panel state back to menu checkboxes
    useEffect(() => {
        invoke('sync_menu_state', {
            leftPanelVisible,
            rightPanelVisible,
        });
    }, [leftPanelVisible, rightPanelVisible]);
}
```

### 4. Complete Menu Setup

**Full main.rs Implementation**:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    image::Image,
    menu::{
        AboutMetadata, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItem,
        PredefinedMenuItem, Submenu, SubmenuBuilder,
    },
    Manager,
};
use tauri::tray::TrayIconBuilder;

mod commands;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Sentinel.", name)
}

#[tauri::command]
fn sync_menu_state(
    app: tauri::AppHandle,
    left_panel_visible: bool,
    right_panel_visible: bool,
) -> Result<(), String> {
    // Update menu check states when frontend state changes
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
    // About metadata
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

    // App menu (macOS) / Help menu About item (Windows/Linux)
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

    // File menu
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

    // Edit menu with predefined items
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

    // Panel visibility items
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

    let panels_submenu = SubmenuBuilder::new(app, "Panels")
        .item(&left_panel)
        .item(&right_panel)
        .build()?;

    // View menu
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

    // Window menu (macOS)
    #[cfg(target_os = "macos")]
    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .item(&PredefinedMenuItem::maximize(app, Some("Zoom"))?)
        .separator()
        .fullscreen()
        .separator()
        .item(&MenuItem::with_id(app, "bring_all_to_front", "Bring All to Front", true, None::<&str>)?)
        .build()?;

    // Help menu
    let mut help_menu_builder = SubmenuBuilder::new(app, "Help")
        .item(&MenuItem::with_id(app, "documentation", "Sentinel Documentation", true, Some("F1"))?)
        .item(&MenuItem::with_id(app, "keyboard_shortcuts", "Keyboard Shortcuts", true, Some("CmdOrCtrl+/"))?);

    #[cfg(not(target_os = "macos"))]
    {
        help_menu_builder = help_menu_builder
            .separator()
            .about(Some(about_metadata));
    }

    let help_menu = help_menu_builder
        .separator()
        .item(&MenuItem::with_id(app, "report_issue", "Report Issue...", true, None::<&str>)?)
        .item(&MenuItem::with_id(app, "check_updates", "Check for Updates...", true, None::<&str>)?)
        .build()?;

    // Build complete menu
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
                    // View operations
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
                    // Help
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
                        // Open GitHub issues page
                        let _ = open::that("https://github.com/navam/sentinel/issues");
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
```

## Frontend Integration

### Menu Event Hook

Create `frontend/src/hooks/useMenuEvents.ts`:

```typescript
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useCanvasStore } from '../stores/canvasStore';

export function useMenuEvents() {
    const {
        toggleLeftPanel,
        toggleRightPanel,
        leftPanelVisible,
        rightPanelVisible,
    } = useWorkspaceStore();

    const { openSettings } = useSettingsStore();
    const { zoomIn, zoomOut, resetZoom, fitView, toggleMinimap } = useCanvasStore();

    useEffect(() => {
        const listeners: Promise<() => void>[] = [];

        // Settings menu
        listeners.push(
            listen('menu:settings', () => {
                openSettings();
            })
        );

        // Panel toggles
        listeners.push(
            listen<string>('menu:toggle-panel', (event) => {
                if (event.payload === 'left') {
                    toggleLeftPanel();
                } else if (event.payload === 'right') {
                    toggleRightPanel();
                }
            })
        );

        // Zoom controls
        listeners.push(
            listen<string>('menu:zoom', (event) => {
                switch (event.payload) {
                    case 'in':
                        zoomIn();
                        break;
                    case 'out':
                        zoomOut();
                        break;
                    case 'reset':
                        resetZoom();
                        break;
                }
            })
        );

        // Canvas controls
        listeners.push(
            listen<string>('menu:canvas', (event) => {
                switch (event.payload) {
                    case 'fit':
                        fitView();
                        break;
                    case 'toggle-minimap':
                        toggleMinimap();
                        break;
                }
            })
        );

        // File operations
        listeners.push(
            listen<string>('menu:file', (event) => {
                // Dispatch to file operation handlers
                window.dispatchEvent(new CustomEvent('sentinel:file-action', {
                    detail: { action: event.payload }
                }));
            })
        );

        // Help menu
        listeners.push(
            listen<string>('menu:help', (event) => {
                switch (event.payload) {
                    case 'docs':
                        window.open('https://docs.navam.io/sentinel', '_blank');
                        break;
                    case 'shortcuts':
                        // Open keyboard shortcuts dialog
                        window.dispatchEvent(new CustomEvent('sentinel:show-shortcuts'));
                        break;
                    case 'check-updates':
                        // Trigger update check
                        window.dispatchEvent(new CustomEvent('sentinel:check-updates'));
                        break;
                }
            })
        );

        return () => {
            listeners.forEach((listener) => {
                listener.then((unlisten) => unlisten());
            });
        };
    }, [
        toggleLeftPanel,
        toggleRightPanel,
        openSettings,
        zoomIn,
        zoomOut,
        resetZoom,
        fitView,
        toggleMinimap,
    ]);

    // Sync panel state back to menu
    useEffect(() => {
        import('@tauri-apps/api/core').then(({ invoke }) => {
            invoke('sync_menu_state', {
                leftPanelVisible,
                rightPanelVisible,
            }).catch(console.error);
        });
    }, [leftPanelVisible, rightPanelVisible]);
}
```

### App.tsx Integration

```typescript
// In App.tsx
import { useMenuEvents } from './hooks/useMenuEvents';

function App() {
    // Initialize menu event listeners
    useMenuEvents();

    // ... rest of component
}
```

## Cargo.toml Updates

Ensure the following features are enabled:

```toml
[dependencies]
tauri = { version = "2.9", features = ["devtools", "image-png"] }
open = "5"  # For opening URLs
```

## Testing Checklist

### Manual Testing

**macOS**:
- [ ] App menu shows "Sentinel" (not "sentinel" or other)
- [ ] About Sentinel shows proper dialog with icon, version, copyright
- [ ] Settings... (⌘,) opens Settings dialog
- [ ] Services submenu appears
- [ ] Hide/Hide Others/Show All work
- [ ] Quit Sentinel (⌘Q) works
- [ ] View > Panels > Left Panel toggles left panel
- [ ] View > Panels > Right Panel toggles right panel
- [ ] Panel checkmarks sync with actual panel state
- [ ] Keyboard shortcuts (⌘1, ⌘2) work for panel toggles

**Windows/Linux**:
- [ ] Help > About Sentinel shows proper dialog
- [ ] File > Settings... (Ctrl+,) opens Settings dialog
- [ ] File > Exit works
- [ ] View > Panels submenu works
- [ ] Panel toggles sync correctly
- [ ] Keyboard shortcuts (Ctrl+1, Ctrl+2) work

### Automated Testing

Add E2E tests in `frontend/e2e/menu.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('System Menu', () => {
    test('panel toggle via keyboard shortcut', async ({ page }) => {
        await page.goto('/');

        // Left panel should be visible by default
        await expect(page.locator('[data-testid="left-panel"]')).toBeVisible();

        // Toggle left panel via keyboard
        await page.keyboard.press('Meta+1'); // or 'Control+1' on Windows
        await expect(page.locator('[data-testid="left-panel"]')).not.toBeVisible();

        // Toggle back
        await page.keyboard.press('Meta+1');
        await expect(page.locator('[data-testid="left-panel"]')).toBeVisible();
    });
});
```

## Platform Considerations

### macOS-Specific

1. App menu is automatically named "Sentinel" (from tauri.conf.json productName)
2. About dialog uses macOS native styling
3. Services submenu integrates with system services
4. Menu bar is global (not window-bound)

### Windows/Linux-Specific

1. Menu bar attached to window
2. About item in Help menu (not app menu)
3. Settings in File menu (not app menu)
4. No Services submenu

## Accessibility

- All menu items have keyboard accelerators
- Menu items use standard platform conventions
- Checkable items properly indicate state
- Screen reader compatible (native menus)

## Future Enhancements

1. **Recent Files Submenu** (v0.28.0)
   - Track recently opened test files
   - Clear recent files option

2. **Window List** (v0.29.0)
   - List of open windows in Window menu (macOS)

3. **Context Menus** (v0.30.0)
   - Canvas right-click menu
   - Node right-click menu
   - Panel right-click menu

## References

- [Tauri Window Menu API](https://v2.tauri.app/learn/window-menu/)
- [AboutMetadata Docs](https://docs.rs/tauri/latest/tauri/menu/struct.AboutMetadata.html)
- [PredefinedMenuItem Docs](https://docs.rs/tauri/latest/tauri/menu/struct.PredefinedMenuItem.html)
- [Apple HIG - Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- [Windows Menu Guidelines](https://learn.microsoft.com/en-us/windows/win32/uxguide/cmd-menus)

---

**Document Status**: Ready for Implementation
**Next Steps**: Update `frontend/src-tauri/src/main.rs` with menu implementation
