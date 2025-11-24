---
source: https://v2.tauri.app/learn/system-tray/
fetched: 2025-11-24
category: tauri
version: 2.x
knowledge_type: api_reference
---

# Tauri v2 System Tray API

> **Knowledge Grounding**: Complete API reference for creating and managing system tray icons in Tauri v2. Covers JavaScript and Rust APIs, menu integration, event handling, and platform-specific behavior.

## Configuration

Enable the tray-icon feature in `Cargo.toml`:

```toml
tauri = { version = "2.0.0", features = ["tray-icon"] }
```

## Creating a Tray Icon

### JavaScript

```javascript
import { TrayIcon } from '@tauri-apps/api/tray';

const options = {
  // icon, menu, title, tooltip, action, menuOnLeftClick
};
const tray = await TrayIcon.new(options);
```

### Rust

```rust
use tauri::tray::TrayIconBuilder;

tauri::Builder::default()
  .setup(|app| {
    let tray = TrayIconBuilder::new().build(app)?;
    Ok(())
  })
```

## Using Application Icon

### JavaScript

```javascript
import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';

const options = {
  icon: await defaultWindowIcon(),
};
const tray = await TrayIcon.new(options);
```

### Rust

```rust
let tray = TrayIconBuilder::new()
  .icon(app.default_window_icon().unwrap().clone())
  .build(app)?;
```

## Adding a Menu

### JavaScript

```javascript
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';

const menu = await Menu.new({
  items: [
    {
      id: 'quit',
      text: 'Quit',
    },
  ],
});

const options = {
  menu,
  menuOnLeftClick: true,
};
const tray = await TrayIcon.new(options);
```

### Rust

```rust
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
};

let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
let menu = Menu::with_items(app, &[&quit_i])?;

let tray = TrayIconBuilder::new()
  .menu(&menu)
  .menu_on_left_click(true)
  .build(app)?;
```

## Menu Event Handling

### JavaScript - Shared Handler

```javascript
import { Menu } from '@tauri-apps/api/menu';

function onTrayMenuClick(itemId) {
  // itemId === 'quit'
}

const menu = await Menu.new({
  items: [
    {
      id: 'quit',
      text: 'Quit',
      action: onTrayMenuClick,
    },
  ],
});
```

### JavaScript - Dedicated Handler

```javascript
import { Menu } from '@tauri-apps/api/menu';

const menu = await Menu.new({
  items: [
    {
      id: 'quit',
      text: 'Quit',
      action: () => {
        console.log('quit pressed');
      },
    },
  ],
});
```

### Rust

```rust
use tauri::tray::TrayIconBuilder;

TrayIconBuilder::new()
  .on_menu_event(|app, event| match event.id.as_ref() {
    "quit" => {
      println!("quit menu item was clicked");
      app.exit(0);
    }
    _ => {
      println!("menu item {:?} not handled", event.id);
    }
  })
```

## Tray Icon Events

Five event types are emitted:

| Event | Description |
|-------|-------------|
| `Click` | Single click with button and button state info |
| `DoubleClick` | Double-click with button info |
| `Enter` | Cursor enters tray icon area with position |
| `Move` | Cursor moves over icon with position |
| `Leave` | Cursor leaves icon area with position |

> **Linux Note**: Tray events are unsupported on Linux. The icon displays and right-click context menu works, but events are not emitted.

### JavaScript

```javascript
import { TrayIcon } from '@tauri-apps/api/tray';

const options = {
  action: (event) => {
    switch (event.type) {
      case 'Click':
        console.log(
          `mouse ${event.button} button pressed, state: ${event.buttonState}`
        );
        break;
      case 'DoubleClick':
        console.log(`mouse ${event.button} button pressed`);
        break;
      case 'Enter':
        console.log(
          `mouse hovered tray at ${event.rect.position.x}, ${event.rect.position.y}`
        );
        break;
      case 'Move':
        console.log(
          `mouse moved on tray at ${event.rect.position.x}, ${event.rect.position.y}`
        );
        break;
      case 'Leave':
        console.log(
          `mouse left tray at ${event.rect.position.x}, ${event.rect.position.y}`
        );
        break;
    }
  },
};
const tray = await TrayIcon.new(options);
```

### Rust

```rust
use tauri::{
  Manager,
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent}
};

TrayIconBuilder::new()
  .on_tray_icon_event(|tray, event| match event {
    TrayIconEvent::Click {
      button: MouseButton::Left,
      button_state: MouseButtonState::Up,
      ..
    } => {
      println!("left click pressed and released");
      let app = tray.app_handle();
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
      }
    }
    _ => {
      println!("unhandled event {event:?}");
    }
  })
```

## API Reference

### TrayIconOptions (JavaScript)

| Property | Type | Description |
|----------|------|-------------|
| `icon` | Image | Icon to display in tray |
| `menu` | Menu | Menu to attach to tray |
| `menuOnLeftClick` | boolean | Show menu on left click (default: true) |
| `action` | function | Event handler for tray events |
| `title` | string | Tray title text |
| `tooltip` | string | Tooltip text on hover |

### TrayIconBuilder Methods (Rust)

| Method | Description |
|--------|-------------|
| `.icon(image)` | Set tray icon |
| `.menu(&menu)` | Attach menu |
| `.menu_on_left_click(bool)` | Control left-click menu display |
| `.on_menu_event(handler)` | Handle menu item clicks |
| `.on_tray_icon_event(handler)` | Handle tray icon events |
| `.build(app)` | Build the tray icon |

### Event Properties

**Click/DoubleClick:**
- `button` - MouseButton (Left, Right, Middle)
- `buttonState` - MouseButtonState (Up, Down)

**Enter/Move/Leave:**
- `rect.position.x` - X coordinate
- `rect.position.y` - Y coordinate

## Menu Display Control

By default, menu appears on both left and right clicks.

**Disable left-click menu (JavaScript):**
```javascript
const options = {
  menu,
  menuOnLeftClick: false,
};
```

**Disable left-click menu (Rust):**
```rust
TrayIconBuilder::new()
  .menu(&menu)
  .menu_on_left_click(false)
  .build(app)?;
```

## Related

- See `refer/tauri/v2-window-menu.md` for advanced menu creation including submenus, icons, and dynamic updates.
