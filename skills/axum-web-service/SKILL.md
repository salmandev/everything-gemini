---
name: axum-web-service
description: >-
  Architects, builds, and optimizes production Rust web APIs using Axum, Tokio async runtime, Tower middlewares, type-safe state extractors, and SQLx connection pools.
---

# Axum Web Service Architecture (Rust)

This skill guides engineering microservices with Axum—the high-throughput, ergonomic Rust web framework built on top of Tokio, Tower, and Hyper.

---

## ⚡ Core Patterns

### 1. Application State & Router Composition (`main.rs`)

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use sqlx::PgPool;
use std::{net::SocketAddr, sync::Arc};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: redis::aio::ConnectionManager,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let db_pool = PgPool::connect(&std::env::var("DATABASE_URL")?).await?;
    let redis_client = redis::Client::open(std::env::var("REDIS_URL")?)?;
    let redis_mgr = redis_client.get_tokio_connection_manager().await?;

    let shared_state = Arc::new(AppState {
        db: db_pool,
        redis: redis_mgr,
    });

    let app = Router::new()
        .route("/healthz", get(|| async { StatusCode::OK }))
        .nest("/api/v1", api_v1_router())
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(shared_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("Listening on {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
```

---

### 2. Type-Safe Handlers with SQLx (`handlers/users.rs`)

Use Axum's compile-time extractors to ensure payload and state invariants before handler execution:

```rust
use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::{AppState, error::AppError};

#[derive(Deserialize)]
pub struct CreateUserPayload {
    pub username: String,
    pub email: String,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub id: i64,
    pub username: String,
    pub email: String,
}

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserPayload>,
) -> Result<Json<UserResponse>, AppError> {
    // Compile-time verified query via SQLx
    let user = sqlx::query_as!(
        UserResponse,
        r#"
        INSERT INTO users (username, email)
        VALUES ($1, $2)
        RETURNING id, username, email
        "#,
        payload.username,
        payload.email
    )
    .fetch_one(&state.db)
    .await?;

    Ok(Json(user))
}
```

---

### 3. Unified RFC 7807 Error Envelope (`error.rs`)

Transform any internal database or validation failure into clean, typed JSON responses using `IntoResponse`:

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Resource not found")]
    NotFound,
    #[error("Validation failed: {0}")]
    Validation(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, detail) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "The requested resource does not exist.".to_string()),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Database(err) => {
                tracing::error!("Internal DB error: {:?}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, "An internal server error occurred.".to_string())
            }
        };

        let body = Json(json!({
            "type": "https://errors.example.com",
            "title": status.canonical_reason().unwrap_or("Error"),
            "status": status.as_u16(),
            "detail": detail
        }));

        (status, body).into_response()
    }
}
```
