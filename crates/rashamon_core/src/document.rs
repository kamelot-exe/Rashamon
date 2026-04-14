//! Document model — top-level container for all content.

use serde::{Deserialize, Serialize};

use crate::error::{CoreError, Result};
use crate::scene_graph::{self, SceneNode};
use crate::styles::DocumentStyle;
use crate::components::ComponentDefinition;

/// Document metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub title: String,
    #[serde(default)]
    pub author: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub created_at: String,
    pub modified_at: String,
}

/// Canvas configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub width: f64,
    pub height: f64,
    #[serde(default)]
    pub background: Option<String>,
    #[serde(default = "default_units")]
    pub units: String,
    #[serde(default = "default_color_profile")]
    pub color_profile: String,
}

fn default_units() -> String {
    "px".to_string()
}

fn default_color_profile() -> String {
    "sRGB".to_string()
}

impl Default for Canvas {
    fn default() -> Self {
        Self {
            width: 1920.0,
            height: 1080.0,
            background: Some("#FFFFFF".to_string()),
            units: default_units(),
            color_profile: default_color_profile(),
        }
    }
}

/// Top-level Rashamon document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub version: String,
    pub metadata: Metadata,
    pub canvas: Canvas,
    pub root: SceneNode,
    /// Reusable styles defined in this document.
    #[serde(default)]
    pub styles: Vec<DocumentStyle>,
    /// Component definitions for this document.
    #[serde(default)]
    pub components: Vec<ComponentDefinition>,
}

impl Document {
    /// Create a new empty document with default settings.
    pub fn new(title: &str) -> Self {
        let now = chrono_now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            version: "0.0.0".to_string(),
            metadata: Metadata {
                title: title.to_string(),
                author: String::new(),
                description: String::new(),
                tags: Vec::new(),
                created_at: now.clone(),
                modified_at: now,
            },
            canvas: Canvas::default(),
            root: scene_graph::create_root(),
        }
    }

    /// Validate the document structure.
    pub fn validate(&self) -> Result<()> {
        if self.canvas.width <= 0.0 {
            return Err(CoreError::Validation(
                "Canvas width must be positive".to_string(),
            ));
        }
        if self.canvas.height <= 0.0 {
            return Err(CoreError::Validation(
                "Canvas height must be positive".to_string(),
            ));
        }
        if self.root.node_type() != scene_graph::SceneNodeType::Group {
            return Err(CoreError::Validation(
                "Root node must be a group".to_string(),
            ));
        }
        Ok(())
    }

    /// Serialize the document to a JSON string.
    pub fn to_json(&self) -> Result<String> {
        serde_json::to_string_pretty(self).map_err(CoreError::from)
    }

    /// Deserialize a document from a JSON string.
    pub fn from_json(json: &str) -> Result<Self> {
        serde_json::from_str(json).map_err(CoreError::from)
    }

    /// Get the total node count (including all children).
    pub fn node_count(&self) -> usize {
        self.root.count()
    }
}

fn chrono_now() -> String {
    // Simple ISO 8601 timestamp without external crate dependency
    // In production, use chrono::Utc::now().to_rfc3339()
    "2026-04-11T00:00:00Z".to_string()
}
