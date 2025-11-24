use std::env;
use std::path::Path;

#[tauri::command]
pub fn get_project_root() -> Result<String, String> {
    let current_dir = env::current_dir().map_err(|e| e.to_string())?;
    let current_path = current_dir.to_string_lossy().to_string();

    // Try to find "sentinel" directory in the path
    // Path structure: .../sentinel/frontend/src-tauri or .../sentinel/frontend/src-tauri/target/debug
    let path_obj = Path::new(&current_path);

    // Walk up the directory tree to find the sentinel project root
    for ancestor in path_obj.ancestors() {
        // Check if this directory is named "sentinel" and has frontend/src-tauri as children
        if ancestor.file_name().and_then(|n| n.to_str()) == Some("sentinel") {
            // Verify it's the right sentinel by checking if it has frontend/src-tauri
            let src_tauri = ancestor.join("frontend").join("src-tauri");
            if src_tauri.exists() {
                return Ok(ancestor.to_string_lossy().to_string());
            }
        }
    }

    // Fallback: if we're in src-tauri or its subdirectories, walk up
    if current_path.contains("frontend/src-tauri") || current_path.contains("frontend\\src-tauri") {
        // Find the position of src-tauri and go up from there
        for ancestor in path_obj.ancestors() {
            if ancestor.file_name().and_then(|n| n.to_str()) == Some("src-tauri") {
                // Go up: src-tauri -> frontend -> sentinel
                if let Some(frontend_dir) = ancestor.parent() {
                    if let Some(project_root) = frontend_dir.parent() {
                        return Ok(project_root.to_string_lossy().to_string());
                    }
                }
            }
        }
    }

    // Last resort: return current directory
    Ok(current_path)
}
