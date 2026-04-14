//! Scene graph — hierarchical representation of canvas objects.

use serde::{Deserialize, Serialize};

use crate::geometry::Geometry;
use crate::transform::Transform;

/// Types of scene nodes.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SceneNodeType {
    Group,
    Frame,
    Shape,
    Text,
    Image,
}

/// A fill representation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fill {
    #[serde(rename = "type")]
    pub fill_type: String, // "solid", "gradient", "pattern"
    pub color: Option<String>,
}

/// A stroke representation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stroke {
    pub color: String,
    pub width: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dash_pattern: Option<Vec<f64>>,
}

/// Semantic role for a scene node.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum SemanticRole {
    Background,
    Foreground,
    UiElement(String),
    Annotation,
    Guide,
    Custom(String),
}

/// A node in the scene graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SceneNode {
    Group {
        id: String,
        name: String,
        children: Vec<SceneNode>,
        #[serde(default)]
        transform: Transform,
        #[serde(default = "default_true")]
        visible: bool,
        #[serde(default)]
        locked: bool,
        #[serde(default = "default_one")]
        opacity: f64,
        #[serde(default)]
        semantic_tags: Vec<String>,
        #[serde(default)]
        semantic_role: Option<SemanticRole>,
    },
    /// Frame — a sized container that acts as an artboard/design surface.
    Frame {
        id: String,
        name: String,
        width: f64,
        height: f64,
        #[serde(default)]
        background: Option<String>,
        #[serde(default = "default_true")]
        clip_content: bool,
        children: Vec<SceneNode>,
        #[serde(default)]
        transform: Transform,
        #[serde(default = "default_true")]
        visible: bool,
        #[serde(default)]
        locked: bool,
        #[serde(default = "default_one")]
        opacity: f64,
        #[serde(default)]
        semantic_tags: Vec<String>,
        #[serde(default)]
        semantic_role: Option<SemanticRole>,
    },
    Shape {
        id: String,
        name: String,
        geometry: Geometry,
        fill: Option<Fill>,
        stroke: Option<Stroke>,
        #[serde(default)]
        transform: Transform,
        #[serde(default = "default_true")]
        visible: bool,
        #[serde(default)]
        locked: bool,
        #[serde(default = "default_one")]
        opacity: f64,
        #[serde(default)]
        semantic_tags: Vec<String>,
        #[serde(default)]
        semantic_role: Option<SemanticRole>,
    },
    Text {
        id: String,
        name: String,
        content: String,
        #[serde(default = "default_font")]
        font_family: String,
        #[serde(default = "default_font_size")]
        font_size: f64,
        #[serde(default = "default_black")]
        fill_color: String,
        #[serde(default)]
        transform: Transform,
        #[serde(default = "default_true")]
        visible: bool,
        #[serde(default)]
        locked: bool,
        #[serde(default = "default_one")]
        opacity: f64,
    },
    Image {
        id: String,
        name: String,
        asset_ref: String,
        #[serde(default)]
        transform: Transform,
        #[serde(default = "default_true")]
        visible: bool,
        #[serde(default)]
        locked: bool,
        #[serde(default = "default_one")]
        opacity: f64,
    },
}

// Default value helpers
fn default_true() -> bool {
    true
}
fn default_one() -> f64 {
    1.0
}
fn default_font() -> String {
    "Inter".to_string()
}
fn default_font_size() -> f64 {
    16.0
}
fn default_black() -> String {
    "#000000".to_string()
}

impl SceneNode {
    /// Get the node's ID.
    pub fn id(&self) -> &str {
        match self {
            SceneNode::Group { id, .. }
            | SceneNode::Frame { id, .. }
            | SceneNode::Shape { id, .. }
            | SceneNode::Text { id, .. }
            | SceneNode::Image { id, .. } => id,
        }
    }

    /// Get the node's name.
    pub fn name(&self) -> &str {
        match self {
            SceneNode::Group { name, .. }
            | SceneNode::Frame { name, .. }
            | SceneNode::Shape { name, .. }
            | SceneNode::Text { name, .. }
            | SceneNode::Image { name, .. } => name,
        }
    }

    /// Get a mutable reference to the node's name.
    pub fn name_mut(&mut self) -> &mut String {
        match self {
            SceneNode::Group { name, .. }
            | SceneNode::Frame { name, .. }
            | SceneNode::Shape { name, .. }
            | SceneNode::Text { name, .. }
            | SceneNode::Image { name, .. } => name,
        }
    }

    /// Check if the node is visible.
    pub fn is_visible(&self) -> bool {
        match self {
            SceneNode::Group { visible, .. }
            | SceneNode::Frame { visible, .. }
            | SceneNode::Shape { visible, .. }
            | SceneNode::Text { visible, .. }
            | SceneNode::Image { visible, .. } => *visible,
        }
    }

    /// Get a mutable reference to transform.
    pub fn transform_mut(&mut self) -> &mut Transform {
        match self {
            SceneNode::Group { transform, .. }
            | SceneNode::Frame { transform, .. }
            | SceneNode::Shape { transform, .. }
            | SceneNode::Text { transform, .. }
            | SceneNode::Image { transform, .. } => transform,
        }
    }

    /// Get mutable reference to children if this is a group or frame.
    pub fn children_mut(&mut self) -> Option<&mut Vec<SceneNode>> {
        match self {
            SceneNode::Group { children, .. }
            | SceneNode::Frame { children, .. } => Some(children),
            _ => None,
        }
    }

    /// Get the node type.
    pub fn node_type(&self) -> SceneNodeType {
        match self {
            SceneNode::Group { .. } => SceneNodeType::Group,
            SceneNode::Frame { .. } => SceneNodeType::Frame,
            SceneNode::Shape { .. } => SceneNodeType::Shape,
            SceneNode::Text { .. } => SceneNodeType::Text,
            SceneNode::Image { .. } => SceneNodeType::Image,
        }
    }

    /// Find a node by ID (recursive search through children).
    pub fn find_by_id(&self, id: &str) -> Option<&SceneNode> {
        if self.id() == id {
            return Some(self);
        }
        match self {
            SceneNode::Group { children, .. } | SceneNode::Frame { children, .. } => {
                for child in children {
                    if let Some(found) = child.find_by_id(id) {
                        return Some(found);
                    }
                }
            }
            _ => {}
        }
        None
    }

    /// Find a mutable node by ID (recursive search).
    pub fn find_by_id_mut(&mut self, id: &str) -> Option<&mut SceneNode> {
        if self.id() == id {
            return Some(self);
        }
        match self {
            SceneNode::Group { children, .. } | SceneNode::Frame { children, .. } => {
                for child in children {
                    if let Some(found) = child.find_by_id_mut(id) {
                        return Some(found);
                    }
                }
            }
            _ => {}
        }
        None
    }

    /// Count all nodes recursively.
    pub fn count(&self) -> usize {
        let self_count = 1;
        let children_count = match self {
            SceneNode::Group { children, .. } | SceneNode::Frame { children, .. } => {
                children.iter().map(|c| c.count()).sum()
            }
            _ => 0,
        };
        self_count + children_count
    }
}

/// Create a new root group node.
pub fn create_root() -> SceneNode {
    SceneNode::Group {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Root".to_string(),
        children: Vec::new(),
        transform: Transform::identity(),
        visible: true,
        locked: false,
        opacity: 1.0,
        semantic_tags: Vec::new(),
        semantic_role: None,
    }
}
