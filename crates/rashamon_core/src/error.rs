//! Error types for the core crate.

use thiserror::Error;

/// Core error enum for Rashamon document operations.
#[derive(Debug, Error)]
pub enum CoreError {
    #[error("document validation failed: {0}")]
    Validation(String),

    #[error("node not found: {0}")]
    NodeNotFound(String),

    #[error("serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("invalid operation: {0}")]
    InvalidOperation(String),
}

/// Result type alias for core operations.
pub type Result<T> = std::result::Result<T, CoreError>;
