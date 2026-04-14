//! Components system — master components and instances with overrides.
//!
//! Mirrors TypeScript ComponentDefinition and ComponentInstance types.

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// A reusable component definition based on a master node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentDefinition {
    pub id: String,
    pub name: String,
    /// The node ID of the master (frame or group).
    pub master_node_id: String,
    /// Snapshot of the master node's structure at creation.
    pub master_snapshot: Value,
    pub created_at: String,
    pub updated_at: String,
}

/// An override applied to a component instance.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentOverride {
    /// The target node ID within the instance.
    pub node_id: String,
    /// Property path (e.g. "fill", "content", "transform.x").
    pub property: String,
    /// The overridden value.
    pub value: Value,
}
