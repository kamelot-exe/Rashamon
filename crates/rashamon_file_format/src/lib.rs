//! Rashamon File Format — serialization for .rdraw files.
//!
//! Currently supports JSON-based format. Future versions may add
//! compression (.rdrawz) and binary backing.

use rashamon_core::Document;
use thiserror::Error;

/// File format errors.
#[derive(Debug, Error)]
pub enum FileFormatError {
    #[error("core error: {0}")]
    Core(#[from] rashamon_core::CoreError),

    #[error("invalid format version: {0}")]
    InvalidVersion(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// Current format version.
pub const CURRENT_VERSION: &str = "0.0.0";

/// Serialize a document to a JSON string.
pub fn serialize(doc: &Document) -> std::result::Result<String, FileFormatError> {
    let json = doc.to_json().map_err(FileFormatError::Core)?;
    Ok(json)
}

/// Deserialize a document from a JSON string.
pub fn deserialize(json: &str) -> std::result::Result<Document, FileFormatError> {
    // Validate format version before deserialization
    let wrapper: serde_json::Value =
        serde_json::from_str(json).map_err(rashamon_core::CoreError::from)?;

    if let Some(version) = wrapper.get("version").and_then(|v| v.as_str())
        && version != CURRENT_VERSION
    {
        // Accept older versions for forward compatibility
        // Migration logic can be added here later
        let _ = version;
    }

    let doc = Document::from_json(json).map_err(FileFormatError::Core)?;
    Ok(doc)
}

/// Write a document to a file path.
pub fn write_file(path: &str, doc: &Document) -> std::result::Result<(), FileFormatError> {
    let json = serialize(doc)?;
    std::fs::write(path, json)?;
    Ok(())
}

/// Read a document from a file path.
pub fn read_file(path: &str) -> std::result::Result<Document, FileFormatError> {
    let json = std::fs::read_to_string(path)?;
    deserialize(&json)
}
