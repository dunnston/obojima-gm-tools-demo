use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, Query, State,
    },
    http::{header, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    net::SocketAddr,
    path::PathBuf,
    sync::Arc,
};
use tokio::sync::{broadcast, Mutex, oneshot};
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

// Valid table names (whitelist for SQL injection prevention)
const VALID_TABLES: &[&str] = &[
    "characters",
    "sessions",
    "quests",
    "downtime_activities",
    "companions",
    "npcs",
    "encounters",
    "user_potions",
    "user_ingredients",
    "user_creatures",
    "user_magic_items",
    "user_companion_types",
    "calendar_events",
];

// WebSocket sync message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub table: Option<String>,
    pub id: Option<String>,
    pub data: Option<serde_json::Value>,
    pub timestamp: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_id: Option<String>,
}

// Server state shared across handlers
pub struct AppState {
    pub db_path: PathBuf,
    pub broadcast_tx: broadcast::Sender<SyncMessage>,
    pub connected_clients: Arc<Mutex<HashSet<String>>>,
    pub pin: Option<String>,
    pub authenticated_sessions: Arc<Mutex<HashSet<String>>>,
}

// Query params for API requests
#[derive(Debug, Deserialize)]
pub struct DeleteQuery {
    id: String,
}

#[derive(Debug, Deserialize)]
pub struct SettingsQuery {
    key: Option<String>,
}

// PIN verification request/response
#[derive(Debug, Deserialize)]
pub struct PinVerifyRequest {
    pin: String,
}

#[derive(Debug, Serialize)]
pub struct AuthStatusResponse {
    pub requires_pin: bool,
    pub authenticated: bool,
}

#[derive(Debug, Serialize)]
pub struct PinVerifyResponse {
    pub success: bool,
    pub session_token: Option<String>,
    pub error: Option<String>,
}

// API response types
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// Server info returned to frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerInfo {
    pub ip: String,
    pub port: u16,
    pub url: String,
}

// Server status for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    pub running: bool,
    pub info: Option<ServerInfo>,
    pub connected_clients: usize,
}

// Server handle for lifecycle management
pub struct ServerHandle {
    pub shutdown_tx: Option<oneshot::Sender<()>>,
    pub info: ServerInfo,
    pub broadcast_tx: broadcast::Sender<SyncMessage>,
    pub connected_clients: Arc<Mutex<HashSet<String>>>,
}

impl ServerHandle {
    pub async fn get_client_count(&self) -> usize {
        self.connected_clients.lock().await.len()
    }
}

// Validate table name against whitelist
fn is_valid_table(table: &str) -> bool {
    VALID_TABLES.contains(&table)
}

// Get database connection
fn get_db_connection(db_path: &PathBuf) -> Result<Connection, String> {
    Connection::open(db_path).map_err(|e| format!("Database error: {}", e))
}

// GET /api/:table - Get all items from a table
async fn get_all_items(
    Path(table): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Response {
    if !is_valid_table(&table) {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<Vec<serde_json::Value>> {
                success: false,
                data: None,
                error: Some(format!("Invalid table: {}", table)),
            }),
        )
            .into_response();
    }

    let conn = match get_db_connection(&state.db_path) {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<serde_json::Value>> {
                    success: false,
                    data: None,
                    error: Some(e),
                }),
            )
                .into_response();
        }
    };

    // Use format! since table name is validated
    let query = format!("SELECT id, data, updated_at FROM {} ORDER BY updated_at DESC", table);
    let mut stmt = match conn.prepare(&query) {
        Ok(s) => s,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<serde_json::Value>> {
                    success: false,
                    data: None,
                    error: Some(format!("Query error: {}", e)),
                }),
            )
                .into_response();
        }
    };

    let rows = stmt.query_map([], |row| {
        let id: String = row.get(0)?;
        let data: String = row.get(1)?;
        let updated_at: String = row.get(2)?;
        Ok((id, data, updated_at))
    });

    let items: Vec<serde_json::Value> = match rows {
        Ok(rows) => rows
            .filter_map(|r| r.ok())
            .map(|(id, data, updated_at)| {
                let mut parsed: serde_json::Value =
                    serde_json::from_str(&data).unwrap_or(serde_json::json!({}));
                if let Some(obj) = parsed.as_object_mut() {
                    obj.insert("id".to_string(), serde_json::json!(id));
                    obj.insert("_updatedAt".to_string(), serde_json::json!(updated_at));
                }
                parsed
            })
            .collect(),
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<serde_json::Value>> {
                    success: false,
                    data: None,
                    error: Some(format!("Query error: {}", e)),
                }),
            )
                .into_response();
        }
    };

    // Return with the table name as key (matching Next.js API pattern)
    let mut response = serde_json::Map::new();
    response.insert(table, serde_json::json!(items));

    (StatusCode::OK, Json(serde_json::Value::Object(response))).into_response()
}

// POST /api/:table - Create or update an item
async fn save_item(
    Path(table): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<serde_json::Value>,
) -> Response {
    if !is_valid_table(&table) {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                error: Some(format!("Invalid table: {}", table)),
            }),
        )
            .into_response();
    }

    let id = body
        .get("id")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let id = match id {
        Some(id) => id,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    error: Some("Missing id field".to_string()),
                }),
            )
                .into_response();
        }
    };

    let conn = match get_db_connection(&state.db_path) {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    error: Some(e),
                }),
            )
                .into_response();
        }
    };

    let data_str = body.to_string();
    let query = format!(
        "INSERT INTO {} (id, data, updated_at) VALUES (?1, ?2, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET data = ?2, updated_at = datetime('now')",
        table
    );

    match conn.execute(&query, params![id, data_str]) {
        Ok(_) => {
            // Broadcast the update to all connected clients
            let msg = SyncMessage {
                msg_type: "update".to_string(),
                table: Some(table.clone()),
                id: Some(id.clone()),
                data: Some(body.clone()),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
                client_id: None,
            };
            let _ = state.broadcast_tx.send(msg);

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(body),
                    error: None,
                }),
            )
                .into_response()
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                error: Some(format!("Save error: {}", e)),
            }),
        )
            .into_response(),
    }
}

// DELETE /api/:table?id=xxx - Delete an item
async fn delete_item(
    Path(table): Path<String>,
    Query(query): Query<DeleteQuery>,
    State(state): State<Arc<AppState>>,
) -> Response {
    if !is_valid_table(&table) {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                success: false,
                data: None,
                error: Some(format!("Invalid table: {}", table)),
            }),
        )
            .into_response();
    }

    let conn = match get_db_connection(&state.db_path) {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(e),
                }),
            )
                .into_response();
        }
    };

    let sql = format!("DELETE FROM {} WHERE id = ?1", table);
    match conn.execute(&sql, params![query.id]) {
        Ok(_) => {
            // Broadcast the delete to all connected clients
            let msg = SyncMessage {
                msg_type: "delete".to_string(),
                table: Some(table.clone()),
                id: Some(query.id.clone()),
                data: None,
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
                client_id: None,
            };
            let _ = state.broadcast_tx.send(msg);

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(()),
                    error: None,
                }),
            )
                .into_response()
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                success: false,
                data: None,
                error: Some(format!("Delete error: {}", e)),
            }),
        )
            .into_response(),
    }
}

// GET /api/settings - Get all settings or a specific setting
async fn get_settings(
    Query(query): Query<SettingsQuery>,
    State(state): State<Arc<AppState>>,
) -> Response {
    let conn = match get_db_connection(&state.db_path) {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    error: Some(e),
                }),
            )
                .into_response();
        }
    };

    if let Some(key) = query.key {
        // Get specific setting
        let mut stmt = match conn.prepare("SELECT value FROM settings WHERE key = ?1") {
            Ok(s) => s,
            Err(e) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<serde_json::Value> {
                        success: false,
                        data: None,
                        error: Some(format!("Query error: {}", e)),
                    }),
                )
                    .into_response();
            }
        };

        let result: Result<String, _> = stmt.query_row(params![key], |row| row.get(0));

        match result {
            Ok(value) => {
                let parsed: serde_json::Value =
                    serde_json::from_str(&value).unwrap_or(serde_json::json!(value));
                (
                    StatusCode::OK,
                    Json(ApiResponse {
                        success: true,
                        data: Some(serde_json::json!({ "key": key, "value": parsed })),
                        error: None,
                    }),
                )
                    .into_response()
            }
            Err(_) => (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    error: Some(format!("Setting not found: {}", key)),
                }),
            )
                .into_response(),
        }
    } else {
        // Get all settings
        let mut stmt = match conn.prepare("SELECT key, value FROM settings") {
            Ok(s) => s,
            Err(e) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<serde_json::Value> {
                        success: false,
                        data: None,
                        error: Some(format!("Query error: {}", e)),
                    }),
                )
                    .into_response();
            }
        };

        let rows = stmt.query_map([], |row| {
            let key: String = row.get(0)?;
            let value: String = row.get(1)?;
            Ok((key, value))
        });

        let settings: serde_json::Map<String, serde_json::Value> = match rows {
            Ok(rows) => rows
                .filter_map(|r| r.ok())
                .map(|(key, value)| {
                    let parsed: serde_json::Value =
                        serde_json::from_str(&value).unwrap_or(serde_json::json!(value));
                    (key, parsed)
                })
                .collect(),
            Err(e) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<serde_json::Value> {
                        success: false,
                        data: None,
                        error: Some(format!("Query error: {}", e)),
                    }),
                )
                    .into_response();
            }
        };

        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(serde_json::json!({ "settings": settings })),
                error: None,
            }),
        )
            .into_response()
    }
}

// POST /api/settings - Save a setting
async fn save_setting(
    State(state): State<Arc<AppState>>,
    Json(body): Json<serde_json::Value>,
) -> Response {
    let key = body.get("key").and_then(|v| v.as_str());
    let value = body.get("value");

    let (key, value) = match (key, value) {
        (Some(k), Some(v)) => (k.to_string(), v),
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<()> {
                    success: false,
                    data: None,
                    error: Some("Missing key or value field".to_string()),
                }),
            )
                .into_response();
        }
    };

    let conn = match get_db_connection(&state.db_path) {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(e),
                }),
            )
                .into_response();
        }
    };

    let value_str = value.to_string();
    match conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = datetime('now')",
        params![key, value_str],
    ) {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(()),
                error: None,
            }),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()> {
                success: false,
                data: None,
                error: Some(format!("Save error: {}", e)),
            }),
        )
            .into_response(),
    }
}

// GET /api/auth-status - Check if PIN is required and if current session is authenticated
async fn check_auth_status(
    State(state): State<Arc<AppState>>,
    headers: axum::http::HeaderMap,
) -> Response {
    let requires_pin = state.pin.is_some();

    // Check if the session token in headers is authenticated
    let authenticated = if requires_pin {
        if let Some(token) = headers.get("x-session-token").and_then(|v| v.to_str().ok()) {
            let sessions = state.authenticated_sessions.lock().await;
            sessions.contains(token)
        } else {
            false
        }
    } else {
        true // No PIN required means always authenticated
    };

    (
        StatusCode::OK,
        Json(AuthStatusResponse {
            requires_pin,
            authenticated,
        }),
    )
        .into_response()
}

// POST /api/verify-pin - Verify PIN and return session token
async fn verify_pin(
    State(state): State<Arc<AppState>>,
    Json(body): Json<PinVerifyRequest>,
) -> Response {
    // If no PIN is configured, reject the request
    let expected_pin = match &state.pin {
        Some(pin) => pin,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(PinVerifyResponse {
                    success: false,
                    session_token: None,
                    error: Some("PIN protection is not enabled".to_string()),
                }),
            )
                .into_response();
        }
    };

    // Verify the PIN
    if body.pin == *expected_pin {
        // Generate a session token
        let session_token = uuid::Uuid::new_v4().to_string();

        // Store the session token
        {
            let mut sessions = state.authenticated_sessions.lock().await;
            sessions.insert(session_token.clone());
        }

        (
            StatusCode::OK,
            Json(PinVerifyResponse {
                success: true,
                session_token: Some(session_token),
                error: None,
            }),
        )
            .into_response()
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(PinVerifyResponse {
                success: false,
                session_token: None,
                error: Some("Invalid PIN".to_string()),
            }),
        )
            .into_response()
    }
}

// WebSocket handler for real-time sync
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_websocket(socket, state))
}

async fn handle_websocket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();

    // Generate client ID
    let client_id = uuid::Uuid::new_v4().to_string();

    // Add client to connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.insert(client_id.clone());
    }

    // Subscribe to broadcast channel
    let mut broadcast_rx = state.broadcast_tx.subscribe();

    // Send connected message
    let connected_msg = SyncMessage {
        msg_type: "connected".to_string(),
        table: None,
        id: None,
        data: Some(serde_json::json!({ "clientId": client_id })),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64,
        client_id: Some(client_id.clone()),
    };

    if let Ok(msg_str) = serde_json::to_string(&connected_msg) {
        let _ = sender.send(Message::Text(msg_str.into())).await;
    }

    let client_id_clone = client_id.clone();
    let state_clone = state.clone();

    // Spawn task to forward broadcast messages to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            // Don't echo back to the sender
            if msg.client_id.as_ref() == Some(&client_id_clone) {
                continue;
            }

            if let Ok(msg_str) = serde_json::to_string(&msg) {
                if sender.send(Message::Text(msg_str.into())).await.is_err() {
                    break;
                }
            }
        }
    });

    // Handle incoming messages from client
    let client_id_for_recv = client_id.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    if let Ok(mut sync_msg) = serde_json::from_str::<SyncMessage>(&text) {
                        // Tag message with client ID so we don't echo it back
                        sync_msg.client_id = Some(client_id_for_recv.clone());

                        // Handle different message types
                        match sync_msg.msg_type.as_str() {
                            "ping" => {
                                // Respond with pong - handled by send task
                            }
                            "update" | "delete" => {
                                // Broadcast to other clients (the API handler already saved to DB)
                                let _ = state_clone.broadcast_tx.send(sync_msg);
                            }
                            _ => {}
                        }
                    }
                }
                Message::Ping(data) => {
                    // Pong is automatically sent by axum
                    let _ = data;
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }

    // Remove client from connected set
    {
        let mut clients = state.connected_clients.lock().await;
        clients.remove(&client_id);
    }
}

// Create the router with all routes
pub fn create_router(static_dir: PathBuf, state: Arc<AppState>) -> Router {
    // CORS configuration - allow all origins for local network access
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::ACCEPT]);

    // API routes
    let api_routes = Router::new()
        .route("/auth-status", get(check_auth_status))
        .route("/verify-pin", axum::routing::post(verify_pin))
        .route("/settings", get(get_settings).post(save_setting))
        .route("/{table}", get(get_all_items).post(save_item).delete(delete_item));

    // Main router
    Router::new()
        .route("/ws", get(websocket_handler))
        .nest("/api", api_routes)
        .fallback_service(
            ServeDir::new(&static_dir)
                .append_index_html_on_directories(true)
                .fallback(ServeDir::new(&static_dir).append_index_html_on_directories(true)),
        )
        .layer(cors)
        .with_state(state)
}

// Start the server
pub async fn start_server(
    port: u16,
    static_dir: PathBuf,
    db_path: PathBuf,
    pin: Option<String>,
) -> Result<ServerHandle, String> {
    // Get local IP address
    let local_ip = local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string());

    let (broadcast_tx, _) = broadcast::channel::<SyncMessage>(100);
    let connected_clients = Arc::new(Mutex::new(HashSet::new()));
    let authenticated_sessions = Arc::new(Mutex::new(HashSet::new()));

    let state = Arc::new(AppState {
        db_path,
        broadcast_tx: broadcast_tx.clone(),
        connected_clients: connected_clients.clone(),
        pin,
        authenticated_sessions,
    });

    let router = create_router(static_dir, state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|e| format!("Failed to bind to port {}: {}", port, e))?;

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    let server_info = ServerInfo {
        ip: local_ip,
        port,
        url: format!("http://{}:{}",
            local_ip_address::local_ip().map(|ip| ip.to_string()).unwrap_or_else(|_| "127.0.0.1".to_string()),
            port
        ),
    };

    let info_clone = server_info.clone();

    // Spawn the server
    tokio::spawn(async move {
        axum::serve(listener, router)
            .with_graceful_shutdown(async {
                let _ = shutdown_rx.await;
            })
            .await
            .ok();
    });

    Ok(ServerHandle {
        shutdown_tx: Some(shutdown_tx),
        info: info_clone,
        broadcast_tx,
        connected_clients,
    })
}
