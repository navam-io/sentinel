# Spec 06: Backend Bundling for Desktop App

**Status**: Planning
**Target Release**: v0.16.0 - v0.18.0
**Type**: Architecture Enhancement
**Priority**: P2 (Post-V1)

---

## Overview

Bundle the Python FastAPI backend with the Tauri desktop app to provide a **seamless single-application experience**. Users should not need to manually start the backend server - it should be automatically managed by the desktop app.

**Goal**: One-click launch, zero configuration, no visible backend server.

---

## Current State vs Future State

### Current State (v0.8.2)

**Two-Process Architecture**:
```
Terminal 1:                 Terminal 2:
$ cd backend                $ cd frontend
$ ./start.sh                $ npm run tauri:dev
  ↓                           ↓
Backend (Python)            Frontend (Tauri + React)
localhost:8000              Desktop Window
```

**User Experience**:
- ❌ Must start backend manually
- ❌ Two separate processes to manage
- ❌ Backend terminal stays open
- ❌ No auto-shutdown on app close
- ❌ Manual dependency installation required

**Developer Experience**:
- ✅ Easy to debug (separate logs)
- ✅ Fast iteration (hot reload both)
- ✅ Clear separation of concerns

---

### Future State (v0.16+)

**Single-Process Experience**:
```
Desktop:
$ Sentinel.app (double-click)
  ↓
Tauri manages backend lifecycle
  ↓
Backend auto-starts (hidden)
  ↓
Frontend connects automatically
  ↓
Single desktop window
```

**User Experience**:
- ✅ One-click launch
- ✅ No visible backend process
- ✅ Auto-starts and auto-stops
- ✅ Single installation
- ✅ No manual configuration

**Developer Experience**:
- ✅ Still debuggable (unified logs)
- ✅ Development mode optional
- ✅ Production bundling automatic

---

## Architecture Options

### Option 1: Sidecar Binary (Recommended)

**Approach**: Bundle Python backend as standalone executable using PyInstaller/PyOxidizer

```
Sentinel.app/
├── Contents/
│   ├── MacOS/
│   │   ├── Sentinel (Tauri app)
│   │   └── sentinel-backend (Python executable)
│   ├── Resources/
│   │   └── backend/ (if needed)
│   └── Info.plist
```

**Tauri Configuration**:
```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "externalBin": ["sentinel-backend"],
      "resources": []
    }
  }
}
```

**Lifecycle Management** (Rust):
```rust
use tauri::api::process::{Command, CommandEvent};

#[tauri::command]
async fn start_backend() -> Result<(), String> {
    // Start backend as sidecar
    let (mut rx, _child) = Command::new_sidecar("sentinel-backend")
        .expect("failed to create sentinel-backend command")
        .spawn()
        .expect("Failed to spawn sidecar");

    // Monitor backend logs
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => println!("Backend: {}", line),
                CommandEvent::Stderr(line) => eprintln!("Backend Error: {}", line),
                _ => {}
            }
        }
    });

    Ok(())
}
```

**Pros**:
- ✅ Tauri's built-in sidecar support
- ✅ Automatic process management
- ✅ Clean separation
- ✅ Easy to debug

**Cons**:
- ⚠️ Larger bundle size (~50-100MB for Python runtime)
- ⚠️ Need to build Python executable per platform

---

### Option 2: Embedded Python Runtime

**Approach**: Embed Python runtime via PyO3 or RustPython

```rust
use pyo3::prelude::*;

fn start_embedded_backend() -> PyResult<()> {
    Python::with_gil(|py| {
        let sys = py.import("sys")?;
        sys.setattr("path", vec!["backend"])?;

        let backend = py.import("backend.main")?;
        let start_server = backend.getattr("start_server")?;
        start_server.call0()?;

        Ok(())
    })
}
```

**Pros**:
- ✅ Tighter integration
- ✅ Single binary (potentially)
- ✅ No separate process

**Cons**:
- ❌ Complex build process
- ❌ Harder to debug
- ❌ GIL (Global Interpreter Lock) issues
- ❌ Limited async support
- ❌ More fragile across Python versions

---

### Option 3: Bundled Python Installer

**Approach**: Ship Python + dependencies, install on first run

```
Sentinel.app/
├── Contents/
│   ├── MacOS/
│   │   └── Sentinel
│   └── Resources/
│       ├── python-3.13-macos.tar.gz
│       └── backend/
│           ├── main.py
│           ├── requirements.txt
│           └── ...
```

**First-Run Setup**:
```rust
async fn ensure_backend_ready() -> Result<(), String> {
    let app_dir = get_app_data_dir();
    let python_dir = app_dir.join("python");

    if !python_dir.exists() {
        // Extract Python runtime
        extract_python_runtime(&python_dir)?;

        // Install dependencies
        Command::new(python_dir.join("bin/pip3"))
            .args(&["install", "-r", "requirements.txt"])
            .output()?;
    }

    // Start backend
    start_backend_process(&python_dir)?;
    Ok(())
}
```

**Pros**:
- ✅ Uses actual Python (not compiled)
- ✅ Easy to update backend code
- ✅ Smaller initial bundle

**Cons**:
- ❌ First-run installation delay
- ❌ More complex deployment
- ❌ Requires write access to app directory

---

## Recommended Approach: Option 1 (Sidecar)

**Decision**: Use Tauri sidecar with PyInstaller/PyOxidizer for Python backend.

**Rationale**:
1. **Native Tauri support** - Built-in sidecar management
2. **Clean separation** - Backend and frontend remain independent
3. **Proven approach** - Many Tauri apps use sidecars successfully
4. **Easy debugging** - Logs remain separate
5. **Cross-platform** - Works on macOS, Windows, Linux

---

## Implementation Plan

### Phase 1: Backend Executable Creation (v0.16.0)

**Goal**: Build standalone Python executable for backend

#### 1.1: Choose Build Tool

**PyInstaller** (Recommended):
```bash
# Install PyInstaller
pip install pyinstaller

# Build backend executable
pyinstaller \
  --name sentinel-backend \
  --onefile \
  --collect-all anthropic \
  --collect-all fastapi \
  --collect-all uvicorn \
  backend/main.py
```

**PyOxidizer** (Alternative - faster, smaller):
```toml
# pyoxidizer.bzl
def make_exe():
    dist = default_python_distribution()
    policy = dist.make_python_packaging_policy()

    exe = dist.to_python_executable(
        name="sentinel-backend",
        packaging_policy=policy,
        config=PythonInterpreterConfig(
            run_module="backend.main",
        ),
    )

    exe.add_python_resources(exe.pip_install(["-r", "requirements.txt"]))

    return exe
```

**Output**: `sentinel-backend` (or `sentinel-backend.exe` on Windows)

#### 1.2: Test Standalone Executable

```bash
# Build
pyinstaller backend.spec

# Test
./dist/sentinel-backend

# Should output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 1.3: Cross-Platform Builds

**macOS** (ARM64 + Intel):
```bash
# ARM64 (Apple Silicon)
pyinstaller --target-arch arm64 backend.spec

# Intel (x86_64)
pyinstaller --target-arch x86_64 backend.spec

# Universal binary (both)
lipo -create dist/sentinel-backend-arm64 dist/sentinel-backend-x86_64 \
     -output dist/sentinel-backend
```

**Windows**:
```bash
pyinstaller --onefile backend.spec
# Output: sentinel-backend.exe
```

**Linux**:
```bash
pyinstaller --onefile backend.spec
# Output: sentinel-backend (ELF binary)
```

---

### Phase 2: Tauri Sidecar Integration (v0.17.0)

**Goal**: Integrate backend executable as Tauri sidecar

#### 2.1: Update Tauri Configuration

**File**: `frontend/src-tauri/tauri.conf.json`

```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "externalBin": [
        "binaries/sentinel-backend-x86_64-apple-darwin",
        "binaries/sentinel-backend-aarch64-apple-darwin",
        "binaries/sentinel-backend-x86_64-pc-windows-msvc",
        "binaries/sentinel-backend-x86_64-unknown-linux-gnu"
      ],
      "resources": []
    }
  }
}
```

**Directory Structure**:
```
frontend/src-tauri/
├── binaries/
│   ├── sentinel-backend-x86_64-apple-darwin
│   ├── sentinel-backend-aarch64-apple-darwin
│   ├── sentinel-backend-x86_64-pc-windows-msvc.exe
│   └── sentinel-backend-x86_64-unknown-linux-gnu
├── src/
│   ├── main.rs
│   └── backend_manager.rs (new)
├── Cargo.toml
└── tauri.conf.json
```

#### 2.2: Backend Manager (Rust)

**File**: `frontend/src-tauri/src/backend_manager.rs`

```rust
use std::sync::Arc;
use std::time::Duration;
use tauri::api::process::{Command, CommandEvent};
use tauri::{Manager, State};
use tokio::sync::Mutex;
use tokio::time::sleep;

pub struct BackendState {
    pub running: Arc<Mutex<bool>>,
    pub port: u16,
}

impl BackendState {
    pub fn new() -> Self {
        Self {
            running: Arc::new(Mutex::new(false)),
            port: 8000,
        }
    }
}

#[tauri::command]
pub async fn start_backend(state: State<'_, BackendState>) -> Result<String, String> {
    let mut running = state.running.lock().await;

    if *running {
        return Ok("Backend already running".to_string());
    }

    // Start backend sidecar
    let (mut rx, _child) = Command::new_sidecar("sentinel-backend")
        .expect("failed to create sentinel-backend command")
        .spawn()
        .map_err(|e| format!("Failed to spawn backend: {}", e))?;

    // Monitor backend output
    let running_clone = state.running.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    log::info!("Backend: {}", line);

                    // Detect when backend is ready
                    if line.contains("Uvicorn running") {
                        let mut running = running_clone.lock().await;
                        *running = true;
                    }
                }
                CommandEvent::Stderr(line) => {
                    log::error!("Backend Error: {}", line);
                }
                CommandEvent::Terminated(payload) => {
                    log::info!("Backend terminated: {:?}", payload);
                    let mut running = running_clone.lock().await;
                    *running = false;
                }
                _ => {}
            }
        }
    });

    // Wait for backend to be ready
    for _ in 0..30 {
        sleep(Duration::from_millis(100)).await;
        let is_running = *state.running.lock().await;
        if is_running {
            return Ok(format!("Backend started on port {}", state.port));
        }
    }

    Err("Backend failed to start within 3 seconds".to_string())
}

#[tauri::command]
pub async fn check_backend_status(state: State<'_, BackendState>) -> Result<bool, String> {
    let running = *state.running.lock().await;
    Ok(running)
}

#[tauri::command]
pub async fn get_backend_url(state: State<'_, BackendState>) -> Result<String, String> {
    Ok(format!("http://localhost:{}", state.port))
}
```

#### 2.3: Main Application Integration

**File**: `frontend/src-tauri/src/main.rs`

```rust
mod backend_manager;

use backend_manager::{BackendState, start_backend, check_backend_status, get_backend_url};

fn main() {
    tauri::Builder::default()
        .manage(BackendState::new())
        .invoke_handler(tauri::generate_handler![
            start_backend,
            check_backend_status,
            get_backend_url,
        ])
        .setup(|app| {
            // Auto-start backend on app launch
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let state = handle.state::<BackendState>();

                match start_backend(state).await {
                    Ok(msg) => log::info!("{}", msg),
                    Err(e) => log::error!("Failed to start backend: {}", e),
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 2.4: Frontend Auto-Connection

**File**: `frontend/src/services/api.ts`

```typescript
import { invoke } from '@tauri-apps/api/tauri';

let backendUrl: string | null = null;

async function ensureBackendReady(): Promise<string> {
  if (backendUrl) return backendUrl;

  try {
    // Wait for backend to be ready
    for (let i = 0; i < 30; i++) {
      const isRunning = await invoke<boolean>('check_backend_status');
      if (isRunning) {
        backendUrl = await invoke<string>('get_backend_url');
        console.log('Backend ready:', backendUrl);
        return backendUrl;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Backend failed to start');
  } catch (error) {
    console.error('Backend startup error:', error);
    throw error;
  }
}

export async function executeTest(testSpec: TestSpec): Promise<ExecutionResult> {
  const baseUrl = await ensureBackendReady();

  const response = await fetch(`${baseUrl}/api/execution/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_spec: testSpec }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}
```

---

### Phase 3: Environment & Configuration (v0.17.0)

**Goal**: Manage API keys and configuration securely

#### 3.1: Config File Location

**Platform-specific paths**:
- **macOS**: `~/Library/Application Support/com.navam.sentinel/config.env`
- **Windows**: `%APPDATA%\com.navam.sentinel\config.env`
- **Linux**: `~/.config/sentinel/config.env`

#### 3.2: First-Run Setup Dialog

**File**: `frontend/src/components/setup/FirstRunSetup.tsx`

```typescript
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { save } from '@tauri-apps/api/dialog';

function FirstRunSetup() {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  const handleSave = async () => {
    try {
      await invoke('save_api_keys', {
        anthropicKey,
        openaiKey,
      });

      // Restart backend with new keys
      await invoke('restart_backend');

      alert('Configuration saved! Backend restarting...');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  return (
    <div className="setup-dialog">
      <h2>Welcome to Sentinel</h2>
      <p>Please enter your API keys to get started:</p>

      <div className="form-group">
        <label>Anthropic API Key (Claude)</label>
        <input
          type="password"
          value={anthropicKey}
          onChange={(e) => setAnthropicKey(e.target.value)}
          placeholder="sk-ant-..."
        />
      </div>

      <div className="form-group">
        <label>OpenAI API Key (Optional)</label>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
        />
      </div>

      <button onClick={handleSave}>Save & Continue</button>
    </div>
  );
}
```

#### 3.3: Rust Config Management

**File**: `frontend/src-tauri/src/config_manager.rs`

```rust
use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

#[tauri::command]
pub async fn save_api_keys(
    app_handle: tauri::AppHandle,
    anthropic_key: String,
    openai_key: String,
) -> Result<(), String> {
    let config_dir = app_data_dir(&app_handle.config())
        .ok_or("Failed to get app data dir")?;

    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config dir: {}", e))?;

    let config_path = config_dir.join("config.env");

    let config_content = format!(
        "ANTHROPIC_API_KEY={}\nOPENAI_API_KEY={}\n",
        anthropic_key, openai_key
    );

    fs::write(&config_path, config_content)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn load_config(app_handle: tauri::AppHandle) -> Result<String, String> {
    let config_dir = app_data_dir(&app_handle.config())
        .ok_or("Failed to get app data dir")?;

    let config_path = config_dir.join("config.env");

    if !config_path.exists() {
        return Ok(String::new());
    }

    fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))
}
```

#### 3.4: Pass Config to Backend

```rust
// In backend_manager.rs
pub async fn start_backend_with_config(
    state: State<'_, BackendState>,
    config: String,
) -> Result<String, String> {
    // Parse config
    let mut env_vars = std::collections::HashMap::new();
    for line in config.lines() {
        if let Some((key, value)) = line.split_once('=') {
            env_vars.insert(key.to_string(), value.to_string());
        }
    }

    // Start backend with environment variables
    let (mut rx, _child) = Command::new_sidecar("sentinel-backend")
        .envs(env_vars)
        .spawn()
        .map_err(|e| format!("Failed to spawn backend: {}", e))?;

    // ... rest of startup logic
    Ok("Backend started".to_string())
}
```

---

### Phase 4: Build & Distribution (v0.18.0)

**Goal**: Automated builds for all platforms

#### 4.1: Build Script

**File**: `scripts/build-all.sh`

```bash
#!/bin/bash
set -e

echo "🏗️  Building Sentinel Desktop App"

# 1. Build backend executables
echo "📦 Building backend executables..."
cd backend

# macOS ARM64
pyinstaller --target-arch arm64 --onefile --name sentinel-backend-aarch64-apple-darwin main.py
mv dist/sentinel-backend-aarch64-apple-darwin ../frontend/src-tauri/binaries/

# macOS Intel
pyinstaller --target-arch x86_64 --onefile --name sentinel-backend-x86_64-apple-darwin main.py
mv dist/sentinel-backend-x86_64-apple-darwin ../frontend/src-tauri/binaries/

cd ..

# 2. Build Tauri app
echo "🚀 Building Tauri desktop app..."
cd frontend
npm run tauri:build

echo "✅ Build complete!"
echo "📦 App bundles:"
ls -lh src-tauri/target/release/bundle/
```

#### 4.2: GitHub Actions CI/CD

**File**: `.github/workflows/build-desktop.yml`

```yaml
name: Build Desktop App

on:
  push:
    tags:
      - 'v*'

jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Build backend (ARM64)
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pyinstaller
          pyinstaller --target-arch arm64 --onefile --name sentinel-backend-aarch64-apple-darwin main.py
          mv dist/sentinel-backend-aarch64-apple-darwin ../frontend/src-tauri/binaries/

      - name: Build backend (Intel)
        run: |
          cd backend
          pyinstaller --target-arch x86_64 --onefile --name sentinel-backend-x86_64-apple-darwin main.py
          mv dist/sentinel-backend-x86_64-apple-darwin ../frontend/src-tauri/binaries/

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build Tauri app
        run: |
          cd frontend
          npm install
          npm run tauri:build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: sentinel-macos
          path: frontend/src-tauri/target/release/bundle/

  build-windows:
    runs-on: windows-latest
    # Similar steps for Windows

  build-linux:
    runs-on: ubuntu-latest
    # Similar steps for Linux
```

---

## User Experience Flows

### First Launch

```
1. User double-clicks Sentinel.app
   ↓
2. App detects no config.env
   ↓
3. Shows "First Run Setup" dialog
   ↓
4. User enters Anthropic API key
   ↓
5. App saves to ~/Library/Application Support/com.navam.sentinel/config.env
   ↓
6. Backend starts with API key
   ↓
7. Main window appears
   ✅ Ready to use
```

### Subsequent Launches

```
1. User double-clicks Sentinel.app
   ↓
2. App loads config.env
   ↓
3. Backend auto-starts (hidden)
   ↓
4. Frontend waits for backend ready
   ↓
5. Main window appears
   ✅ Ready to use (< 2 seconds)
```

### Backend Crash Handling

```
1. Backend crashes during execution
   ↓
2. Frontend detects connection lost
   ↓
3. Shows "Backend disconnected" notification
   ↓
4. Auto-restart backend
   ↓
5. Reconnect frontend
   ✅ Continues working
```

---

## Development Workflow

### Development Mode (Separate Processes)

```bash
# Terminal 1: Backend (hot reload)
cd backend
./start.sh

# Terminal 2: Frontend (hot reload)
cd frontend
npm run tauri:dev
```

**Remains unchanged** - developers can still iterate quickly

### Production Mode (Bundled)

```bash
# Build everything
npm run build:all

# Run bundled app
./frontend/src-tauri/target/release/Sentinel.app
```

**Backend auto-managed** - no manual startup needed

---

## Testing Strategy

### Unit Tests

**Backend Bundling**:
```bash
# Test backend executable builds correctly
./scripts/test-backend-build.sh
```

**Sidecar Integration**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_backend_startup() {
        let state = BackendState::new();
        let result = start_backend(state).await;
        assert!(result.is_ok());
    }
}
```

### Integration Tests

**End-to-End**:
```typescript
describe('Bundled Backend', () => {
  it('should auto-start on app launch', async () => {
    // Launch app
    const app = await launchApp();

    // Wait for backend
    await waitForBackend(5000);

    // Verify connection
    const status = await checkBackendStatus();
    expect(status).toBe(true);
  });

  it('should execute tests successfully', async () => {
    const result = await executeTest({
      name: 'Test',
      model: 'claude-sonnet-4-5-20250929',
      inputs: { query: 'Hello' },
      assertions: [{ must_contain: 'result' }],
    });

    expect(result.success).toBe(true);
  });
});
```

### Manual Testing Checklist

- [ ] macOS ARM64 build works
- [ ] macOS Intel build works
- [ ] Windows build works
- [ ] Linux build works
- [ ] First-run setup flow
- [ ] Config persistence across restarts
- [ ] Backend auto-starts
- [ ] Backend auto-stops on app quit
- [ ] Backend crash recovery
- [ ] API key validation
- [ ] Test execution end-to-end

---

## Bundle Size Optimization

### Current Estimates

**Backend Executable** (PyInstaller):
- Minimal: ~30MB (Python runtime + FastAPI + Anthropic SDK)
- With all deps: ~80MB

**Tauri App**:
- Frontend: ~5MB (React + assets)
- Webview: ~0MB (uses system)
- Backend: ~30-80MB

**Total**: ~35-85MB per platform

### Optimization Strategies

1. **Strip unused Python modules**:
```python
# pyinstaller hook
excludedimports = ['tkinter', 'matplotlib', 'pandas', 'numpy']
```

2. **Use UPX compression**:
```bash
pyinstaller --onefile --upx-dir=/usr/local/bin backend.spec
# Can reduce by 30-50%
```

3. **Lazy load providers**:
```python
# Don't import until needed
def get_provider(model: str):
    if model.startswith('claude-'):
        from .anthropic_provider import AnthropicProvider
        return AnthropicProvider
```

4. **Strip debug symbols**:
```bash
strip sentinel-backend
# Reduces ~20%
```

---

## Migration Path

### For Users

**From v0.8.x → v0.16.x+**:

1. Download new bundled version
2. First launch: Enter API keys (migrated from old .env if exists)
3. Old manual backend setup no longer needed
4. All test specs work unchanged

**No breaking changes**

### For Developers

**Development mode**:
- Option 1: Keep using separate processes (recommended for dev)
- Option 2: Test bundled version periodically

**Build process**:
- New: `npm run build:all` (builds backend + frontend)
- Old: `npm run tauri:build` (still works for frontend-only)

---

## Future Enhancements

### v0.19.0+: Advanced Features

1. **Auto-updates**:
   - Tauri Updater integration
   - Download new backend executable
   - Hot-swap without restart

2. **Multi-backend support**:
   - Switch between local and remote backends
   - Load balancing for teams

3. **Plugin system**:
   - Custom providers as plugins
   - Dynamic loading

4. **Performance monitoring**:
   - Track backend startup time
   - Memory usage alerts
   - Crash reporting

---

## Success Criteria

### Phase 1 (v0.16.0)
- ✅ Backend builds as standalone executable
- ✅ Executable runs on macOS, Windows, Linux
- ✅ All API calls work from executable

### Phase 2 (v0.17.0)
- ✅ Tauri sidecar integration complete
- ✅ Backend auto-starts on app launch
- ✅ Frontend connects automatically
- ✅ No manual backend startup needed

### Phase 3 (v0.17.0)
- ✅ First-run setup dialog works
- ✅ API keys saved securely
- ✅ Config persists across restarts

### Phase 4 (v0.18.0)
- ✅ Automated builds for all platforms
- ✅ Bundle size < 100MB
- ✅ CI/CD pipeline working
- ✅ Releases published automatically

### User Experience
- ✅ One-click launch
- ✅ < 3 second startup time
- ✅ Zero configuration needed
- ✅ No visible backend process
- ✅ Graceful error handling

---

## Known Limitations

1. **Bundle Size**: 35-85MB (acceptable for desktop)
2. **First Launch**: Slightly slower (~3-5s vs ~1-2s)
3. **Python Version**: Locked to bundled version
4. **Dependencies**: Must rebuild executable for updates
5. **Debugging**: Slightly harder than separate processes

**All acceptable tradeoffs for improved UX**

---

## References

- [Tauri Sidecar Documentation](https://tauri.app/v1/guides/building/sidecar/)
- [PyInstaller Manual](https://pyinstaller.org/en/stable/)
- [PyOxidizer Guide](https://pyoxidizer.readthedocs.io/)
- [Tauri Configuration](https://tauri.app/v1/api/config/)

---

**Status**: Ready for implementation post-V1
**Target**: v0.16.0 - v0.18.0
**Estimated Effort**: 3-4 sprints

🎯 **Goal**: Single-click desktop app with zero configuration!
