use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::{AppHandle, Manager, State};
use std::sync::Mutex;

mod network_server;
use network_server::{ServerHandle, ServerInfo, ServerStatus};

// State to hold the network server handle
pub struct NetworkServerState(pub Mutex<Option<ServerHandle>>);

// Tauri command: Start the network server
#[tauri::command]
async fn start_network_server(
    port: u16,
    pin: Option<String>,
    app: AppHandle,
    state: State<'_, NetworkServerState>,
) -> Result<ServerInfo, String> {
    // Check if server is already running (scope the lock)
    {
        let server_guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
        if server_guard.is_some() {
            return Err("Server is already running".to_string());
        }
    } // Guard dropped here

    // Get paths (no lock held)
    let resource_dir = app.path().resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    let static_dir = resource_dir.join("out");

    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_data_dir.join("obojima.db");

    // Start the server (no lock held during await)
    let handle = network_server::start_server(port, static_dir, db_path, pin).await?;
    let info = handle.info.clone();

    // Store the handle (reacquire lock)
    {
        let mut server_guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
        *server_guard = Some(handle);
    }

    Ok(info)
}

// Tauri command: Stop the network server
#[tauri::command]
async fn stop_network_server(
    state: State<'_, NetworkServerState>,
) -> Result<(), String> {
    let mut server_guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(mut handle) = server_guard.take() {
        // Send shutdown signal
        if let Some(tx) = handle.shutdown_tx.take() {
            let _ = tx.send(());
        }
    }

    Ok(())
}

// Tauri command: Get local IP address
#[tauri::command]
fn get_local_ip() -> Result<String, String> {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| format!("Failed to get local IP: {}", e))
}

// Tauri command: Get server status
#[tauri::command]
async fn get_server_status(
    state: State<'_, NetworkServerState>,
) -> Result<ServerStatus, String> {
    // Extract what we need from the lock, then drop it
    let (info, connected_clients_arc) = {
        let server_guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;

        match &*server_guard {
            Some(handle) => {
                (Some(handle.info.clone()), Some(handle.connected_clients.clone()))
            }
            None => (None, None),
        }
    }; // Guard dropped here

    // Now do the async work without holding the lock
    match (info, connected_clients_arc) {
        (Some(info), Some(clients)) => {
            let client_count = clients.lock().await.len();
            Ok(ServerStatus {
                running: true,
                info: Some(info),
                connected_clients: client_count,
            })
        }
        _ => Ok(ServerStatus {
            running: false,
            info: None,
            connected_clients: 0,
        }),
    }
}

// Tauri command: Broadcast a sync message to all connected clients
#[tauri::command]
async fn broadcast_sync_message(
    table: String,
    id: String,
    data: serde_json::Value,
    msg_type: String,
    state: State<'_, NetworkServerState>,
) -> Result<(), String> {
    let server_guard = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(handle) = &*server_guard {
        let msg = network_server::SyncMessage {
            msg_type,
            table: Some(table),
            id: Some(id),
            data: Some(data),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            client_id: Some("desktop".to_string()),
        };

        let _ = handle.broadcast_tx.send(msg);
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create initial tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS characters (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS quests (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS downtime_activities (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS companions (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS npcs (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS encounters (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_potions (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_ingredients (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_creatures (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_magic_items (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_companion_types (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS calendar_events (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            "#,
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:obojima.db", migrations)
                .build(),
        )
        .manage(NetworkServerState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            start_network_server,
            stop_network_server,
            get_local_ip,
            get_server_status,
            broadcast_sync_message,
        ])
        .setup(|app| {
            // Enable devtools in debug builds or when ENABLE_DEVTOOLS env var is set
            #[cfg(any(debug_assertions, feature = "devtools"))]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
