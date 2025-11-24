---
source: https://v2.tauri.app/learn/window-menu/
fetched: 2025-11-24
category: tauri
version: 2.x
knowledge_type: api_reference
---

# Tauri v2 Window Menu API

> **Knowledge Grounding**: Complete API reference for creating and managing native window menus in Tauri v2. Covers JavaScript and Rust APIs, menu types, event handling, icons, accelerators, and platform-specific behavior.

## Overview

Native application menus attach to windows or system tray on desktop platforms. Available via JavaScript (`@tauri-apps/api/menu`) and Rust (`tauri::menu`).

## Base-Level Menus

### JavaScript

```javascript
import { Menu } from '@tauri-apps/api/menu';

const menu = await Menu.new({
  items: [
    {
      id: 'quit',
      text: 'Quit',
      action: () => { console.log('quit pressed'); },
    },
    {
      id: 'check_item',
      text: 'Check Item',
      checked: true,
    },
    { type: 'Separator' },
    {
      id: 'disabled_item',
      text: 'Disabled Item',
      enabled: false,
    },
    {
      id: 'status',
      text: 'Status: Processing...',
    },
  ],
});

menu.setAsAppMenu().then(async (res) => {
  console.log('menu set success', res);
  const statusItem = await menu.get('status');
  if (statusItem) {
    await statusItem.setText('Status: Ready');
  }
});
```

### Rust

```rust
use tauri::menu::MenuBuilder;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let menu = MenuBuilder::new(app)
        .text("open", "Open")
        .text("close", "Close")
        .check("check_item", "Check Item")
        .separator()
        .text("disabled_item", "Disabled Item")
        .text("status", "Status: Processing...")
        .build()?;

      app.set_menu(menu.clone())?;

      menu
        .get("status")
        .unwrap()
        .as_menuitem_unchecked()
        .set_text("Status: Ready")?;

      Ok(())
    })
    .run(tauri::generate_context!())
}
```

## Event Handling

### JavaScript

```javascript
import { Menu } from '@tauri-apps/api/menu';

const menu = await Menu.new({
  items: [
    {
      id: 'Open',
      text: 'open',
      action: () => { console.log('open pressed'); },
    },
    {
      id: 'Close',
      text: 'close',
      action: () => { console.log('close pressed'); },
    },
  ],
});

await menu.setAsAppMenu();
```

### Rust

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::menu::MenuBuilder;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let menu = MenuBuilder::new(app)
        .text("open", "Open")
        .text("close", "Close")
        .build()?;

      app.set_menu(menu)?;

      app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
        println!("menu event: {:?}", event.id());
        match event.id().0.as_str() {
          "open" => { println!("open event"); }
          "close" => { println!("close event"); }
          _ => { println!("unexpected menu event"); }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
}
```

## Multi-Level Menus (Submenus)

> **macOS Note**: All items must be grouped under a submenu. Top-level items will be ignored. The first submenu appears under the application's about menu by default.

### JavaScript

```javascript
import { Menu, MenuItem, Submenu } from '@tauri-apps/api/menu';

const aboutSubmenu = await Submenu.new({
  text: 'About',
  items: [
    await MenuItem.new({
      id: 'quit',
      text: 'Quit',
      action: () => { console.log('Quit pressed'); },
    }),
  ],
});

const fileSubmenu = await Submenu.new({
  text: 'File',
  icon: 'folder', // Since Tauri 2.8.0
  items: [
    await MenuItem.new({
      id: 'new',
      text: 'New',
      action: () => { console.log('New clicked'); },
    }),
    await MenuItem.new({
      id: 'open',
      text: 'Open',
      action: () => { console.log('Open clicked'); },
    }),
    await MenuItem.new({
      id: 'save_as',
      text: 'Save As...',
      action: () => { console.log('Save As clicked'); },
    }),
  ],
});

const editSubmenu = await Submenu.new({
  text: 'Edit',
  items: [
    await MenuItem.new({
      id: 'undo',
      text: 'Undo',
      action: () => { console.log('Undo clicked'); },
    }),
    await MenuItem.new({
      id: 'redo',
      text: 'Redo',
      action: () => { console.log('Redo clicked'); },
    }),
  ],
});

const menu = await Menu.new({
  items: [aboutSubmenu, fileSubmenu, editSubmenu],
});

menu.setAsAppMenu();

// Update icons at runtime
fileSubmenu.setIcon('document');
fileSubmenu.setNativeIcon('NSFolder');
```

### Rust

```rust
use tauri::{
  image::Image,
  menu::{CheckMenuItemBuilder, IconMenuItemBuilder, MenuBuilder, SubmenuBuilder},
};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let menu_image = Image::from_bytes(include_bytes!("../icons/menu.png")).unwrap();
      let file_menu = SubmenuBuilder::new(app, "File")
        .submenu_icon(menu_image)
        .text("open", "Open")
        .text("quit", "Quit")
        .build()?;

      let lang_str = "en";
      let check_sub_item_1 = CheckMenuItemBuilder::new("English")
        .id("en")
        .checked(lang_str == "en")
        .build(app)?;

      let check_sub_item_2 = CheckMenuItemBuilder::new("Chinese")
        .id("zh")
        .checked(lang_str == "zh")
        .enabled(false)
        .build(app)?;

      let icon_image = Image::from_bytes(include_bytes!("../icons/icon.png")).unwrap();
      let icon_item = IconMenuItemBuilder::new("icon")
        .icon(icon_image)
        .build(app)?;

      let other_item = SubmenuBuilder::new(app, "language")
        .item(&check_sub_item_1)
        .item(&check_sub_item_2)
        .build()?;

      let menu = MenuBuilder::new(app)
        .items(&[&file_menu, &other_item, &icon_item])
        .build()?;

      app.set_menu(menu)?;

      // Update icon at runtime
      let menu_image_update = Image::from_bytes(include_bytes!("../icons/menu_update.png")).unwrap();
      file_menu.set_icon(Some(menu_image_update))?;
      file_menu.set_native_icon(Some(tauri::menu::NativeIcon::Folder))?;

      Ok(())
    })
    .run(tauri::generate_context!())
}
```

## Predefined Menu Items

Built-in menu items with OS-specific behavior.

### JavaScript

```javascript
import { Menu, PredefinedMenuItem } from '@tauri-apps/api/menu';

const copy = await PredefinedMenuItem.new({ text: 'copy-text', item: 'Copy' });
const separator = await PredefinedMenuItem.new({ text: 'separator-text', item: 'Separator' });
const undo = await PredefinedMenuItem.new({ text: 'undo-text', item: 'Undo' });
const redo = await PredefinedMenuItem.new({ text: 'redo-text', item: 'Redo' });
const cut = await PredefinedMenuItem.new({ text: 'cut-text', item: 'Cut' });
const paste = await PredefinedMenuItem.new({ text: 'paste-text', item: 'Paste' });
const select_all = await PredefinedMenuItem.new({ text: 'select_all-text', item: 'SelectAll' });

const menu = await Menu.new({
  items: [copy, separator, undo, redo, cut, paste, select_all],
});

await menu.setAsAppMenu();
```

### Rust

```rust
use tauri::menu::{MenuBuilder, PredefinedMenuItem};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let menu = MenuBuilder::new(app)
        .copy()
        .separator()
        .undo()
        .redo()
        .cut()
        .paste()
        .select_all()
        .item(&PredefinedMenuItem::copy(app, Some("custom text"))?)
        .build()?;

      app.set_menu(menu)?;
      Ok(())
    })
    .run(tauri::generate_context!())
}
```

**Available Predefined Items**: `Copy`, `Cut`, `Paste`, `Undo`, `Redo`, `SelectAll`, `Separator`

## Dynamic Menu Updates

### JavaScript

```javascript
import { Menu, CheckMenuItem, IconMenuItem, MenuItem } from '@tauri-apps/api/menu';
import { Image } from '@tauri-apps/api/image';

let currentLanguage = 'en';

const check_sub_item_en = await CheckMenuItem.new({
  id: 'en',
  text: 'English',
  checked: currentLanguage === 'en',
  action: () => {
    currentLanguage = 'en';
    check_sub_item_en.setChecked(currentLanguage === 'en');
    check_sub_item_zh.setChecked(currentLanguage === 'zh');
    console.log('English pressed');
  },
});

const check_sub_item_zh = await CheckMenuItem.new({
  id: 'zh',
  text: 'Chinese',
  checked: currentLanguage === 'zh',
  action: () => {
    currentLanguage = 'zh';
    check_sub_item_en.setChecked(currentLanguage === 'en');
    check_sub_item_zh.setChecked(currentLanguage === 'zh');
    check_sub_item_zh.setAccelerator('Ctrl+L');
    console.log('Chinese pressed');
  },
});

const icon = await Image.fromPath('../src/icon.png');
const icon2 = await Image.fromPath('../src/icon-2.png');

const icon_item = await IconMenuItem.new({
  id: 'icon_item',
  text: 'Icon Item',
  icon: icon,
  action: () => {
    icon_item.setIcon(icon2);
    console.log('icon pressed');
  },
});

const text_item = await MenuItem.new({
  id: 'text_item',
  text: 'Text Item',
  action: () => {
    text_item.setText('Text Item Changed');
    console.log('text pressed');
  },
});

const menu = await Menu.new({
  items: [
    {
      id: 'change menu',
      text: 'change_menu',
      items: [text_item, check_sub_item_en, check_sub_item_zh, icon_item],
    },
  ],
});

await menu.setAsAppMenu();
```

### Rust

```rust
use tauri::{
  image::Image,
  menu::{CheckMenuItemBuilder, IconMenuItem, MenuBuilder, MenuItem, SubmenuBuilder},
};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let check_sub_item_en = CheckMenuItemBuilder::with_id("en", "EN")
        .checked(true)
        .build(app)?;

      let check_sub_item_zh = CheckMenuItemBuilder::with_id("zh", "ZH")
        .checked(false)
        .build(app)?;

      let text_menu = MenuItem::with_id(
        app,
        "change_text",
        &"Change menu".to_string(),
        true,
        Some("Ctrl+Z"),
      ).unwrap();

      let icon_menu = IconMenuItem::with_id(
        app,
        "change_icon",
        &"Change icon menu",
        true,
        Some(Image::from_bytes(include_bytes!("../icons/icon.png")).unwrap()),
        Some("Ctrl+F"),
      ).unwrap();

      let menu_item = SubmenuBuilder::new(app, "Change menu")
        .item(&text_menu)
        .item(&icon_menu)
        .items(&[&check_sub_item_en, &check_sub_item_zh])
        .build()?;

      let menu = MenuBuilder::new(app).items(&[&menu_item]).build()?;
      app.set_menu(menu)?;

      app.on_menu_event(move |_app_handle: &tauri::AppHandle, event| {
        match event.id().0.as_str() {
          "change_text" => {
            text_menu.set_text("changed menu text").expect("Change text error");
          }
          "change_icon" => {
            icon_menu.set_text("changed menu-icon text").expect("Change text error");
            icon_menu.set_icon(Some(
              Image::from_bytes(include_bytes!("../icons/icon-2.png")).unwrap(),
            )).expect("Change icon error");
          }
          "en" | "zh" => {
            check_sub_item_en.set_checked(event.id().0.as_str() == "en").expect("Change check error");
            check_sub_item_zh.set_checked(event.id().0.as_str() == "zh").expect("Change check error");
            check_sub_item_zh.set_accelerator(Some("Ctrl+L")).expect("Change accelerator error");
          }
          _ => { println!("unexpected menu event"); }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application")
}
```

## API Reference

### Menu Item Types

| Type | Properties |
|------|------------|
| Basic Item | `{ id, text, action }` |
| Check Item | `{ id, text, checked: boolean, action }` |
| Icon Item | `{ id, text, icon, action }` |
| Separator | `{ type: 'Separator' }` |
| Disabled Item | `{ enabled: false }` |

### JavaScript Methods

| Method | Description |
|--------|-------------|
| `Menu.new({ items })` | Create menu |
| `menu.setAsAppMenu()` | Apply to window |
| `menu.get(id)` | Get item by ID |
| `Submenu.new({ text, items, icon })` | Create submenu |
| `MenuItem.new({ id, text, action })` | Create item |
| `CheckMenuItem.new({ id, text, checked, action })` | Create check item |
| `IconMenuItem.new({ id, text, icon, action })` | Create icon item |
| `PredefinedMenuItem.new({ text, item })` | Create predefined item |
| `item.setText(text)` | Update text |
| `item.setChecked(boolean)` | Update check state |
| `item.setIcon(icon)` | Update icon |
| `item.setAccelerator(shortcut)` | Set keyboard shortcut |
| `submenu.setIcon(icon)` | Set submenu icon |
| `submenu.setNativeIcon(nativeIcon)` | Set native OS icon |
| `Image.fromPath(path)` | Load image from path |

### Rust Methods

| Method | Description |
|--------|-------------|
| `MenuBuilder::new(app)` | Create builder |
| `.text(id, label)` | Add text item |
| `.check(id, label)` | Add check item |
| `.separator()` | Add separator |
| `.copy()`, `.cut()`, `.paste()` | Predefined items |
| `.undo()`, `.redo()`, `.select_all()` | Predefined items |
| `.item(&item)` | Add custom item |
| `.items(&[items])` | Add multiple items |
| `.build()` | Build menu |
| `app.set_menu(menu)` | Apply menu |
| `app.on_menu_event(handler)` | Register event handler |
| `menu.get(id)` | Get item by ID |
| `.as_menuitem_unchecked()` | Cast to menu item |
| `.set_text(text)` | Update text |
| `.set_checked(boolean)` | Update check state |
| `.set_icon(Some(image))` | Update icon |
| `.set_native_icon(Some(icon))` | Set native icon |
| `.set_accelerator(Some(shortcut))` | Set keyboard shortcut |
| `SubmenuBuilder::new(app, label)` | Create submenu |
| `.submenu_icon(image)` | Set submenu icon |
| `CheckMenuItemBuilder::new(label)` | Create check item builder |
| `.id(id)`, `.checked(bool)`, `.enabled(bool)` | Configure check item |
| `IconMenuItemBuilder::new(label)` | Create icon item builder |
| `.icon(image)` | Set icon |
| `MenuItem::with_id(app, id, label, enabled, accelerator)` | Create with accelerator |
| `IconMenuItem::with_id(app, id, label, enabled, icon, accelerator)` | Create icon item |
| `Image::from_bytes(bytes)` | Create image from bytes |

### Accelerator Format

Keyboard shortcuts use format: `"Ctrl+Z"`, `"Ctrl+L"`, `"Ctrl+F"`, etc.

## Platform-Specific Behavior

### macOS

- **All items must be grouped under submenus** - top-level items ignored
- First submenu appears under application's about menu by default
- Native icons: `NSFolder` and macOS system symbols supported
- Menu bar integration (not window-bound)

### Windows & Linux

- Menus appear as part of application window
- Top-level items supported directly
- No submenu grouping requirement

## Icon Configuration

> **Note**: Icon support for submenus available since **Tauri 2.8.0**

### Cargo Features

```toml
[dependencies]
tauri = { version = "...", features = ["image-png"] }
# or for ICO format:
tauri = { version = "...", features = ["image-ico"] }
```

### Icon Methods

| Platform | Method |
|----------|--------|
| Custom Icon | `.icon(image)` / `.setIcon(image)` |
| Submenu Icon | `.submenu_icon(image)` |
| Native Icon | `.set_native_icon(Some(NativeIcon::Folder))` |
| Native (JS) | `.setNativeIcon('NSFolder')` |
