---
source: https://v2.tauri.app/learn/window-menu/
fetched: 2025-11-24
category: tauri
version: 2.8.0+
knowledge_type: net_new
---

# Tauri v2 Window Menu API

> **Knowledge Grounding Context**: Tauri 2.8.0 introduced icon support for submenus, a new capability not available in earlier versions. This document focuses on v2-specific menu API patterns, platform-specific constraints (especially macOS submenu requirements), and runtime menu manipulation capabilities.

## What's New in Tauri 2.8.0+

### Icon Support for Submenus
**New in Tauri 2.8.0**: Submenus now support icons, expanding visual customization options.

**Rust API:**
```rust
.submenu_icon(Some(icon))
```

**JavaScript API:**
```javascript
{
  icon: iconPath  // or native platform icon
}
```

Supports both:
- Custom image paths (PNG, ICNS, etc.)
- Native platform icons

## Menu Item Types

Tauri v2 provides several menu item types:

1. **Basic Text Items** - Standard clickable menu entries
2. **Check Items** - Togglable items with checked/unchecked state
3. **Icon Menu Items** - Items with custom or native icons (2.8.0+)
4. **Separators** - Visual dividers between menu sections
5. **Predefined/Native Items** - OS-level menu items with built-in behaviors

## Dynamic Menu Updates (Runtime Manipulation)

All menu items support runtime modifications after creation:

### Text Updates
```javascript
menuItem.setText('New Label')
```
```rust
menu_item.set_text("New Label")
```

### Icon Updates
```javascript
menuItem.setIcon(newIcon)
```
```rust
menu_item.set_icon(Some(new_icon))
```

### Toggle State (Check Items)
```javascript
checkItem.setChecked(true)
```
```rust
check_item.set_checked(true)
```

### Accelerator/Keyboard Shortcuts
Can be modified dynamically at runtime.

## Platform-Specific Constraints

### macOS Submenu Requirement

**CRITICAL**: macOS enforces strict menu structure requirements:

> "When using submenus on MacOS, all items must be grouped under a submenu. Top-level items will be ignored."

**Implication**: You cannot have standalone menu items at the root level on macOS—everything must be nested under a submenu.

### macOS Default Layout Behavior

The first submenu is automatically positioned under the application's about menu, **regardless of the text label** you provide.

**Best Practice**: Always include an "About" submenu as the first entry to match expected macOS menu conventions.

## API Parity: JavaScript & Rust

Both language bindings maintain feature parity:

| Feature | JavaScript | Rust |
|---------|-----------|------|
| Menu creation | `Menu.new()` | `MenuBuilder::new()` |
| Submenus | `Submenu` | `SubmenuBuilder` |
| Menu items | `MenuItem` | `MenuItem` |
| Icon items | `MenuItem` (with icon) | `IconMenuItem` |
| Check items | `CheckMenuItem` | `CheckMenuItemBuilder` |
| Native items | `PredefinedMenuItem` | `PredefinedMenuItem` |

## Migration Notes

If migrating from Tauri v1:
- **Icon support for submenus**: Not available in v1.x, new in 2.8.0+
- **Dynamic updates**: Enhanced API for runtime menu manipulation
- **macOS constraints**: More explicitly documented in v2

## Current Best Practices (Tauri v2)

1. **Always use submenus on macOS** to ensure cross-platform compatibility
2. **First submenu = "About"** to align with macOS conventions
3. **Use native icons** where possible for consistent OS look-and-feel
4. **Leverage dynamic updates** for real-time menu state changes (checked states, labels)
5. **Test platform-specific behavior** early in development cycle