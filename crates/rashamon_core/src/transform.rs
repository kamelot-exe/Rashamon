//! Transform representation for scene nodes.

use serde::{Deserialize, Serialize};

/// 2D affine transform represented by position, scale, rotation, and skew.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub x: f64,
    pub y: f64,
    pub scale_x: f64,
    pub scale_y: f64,
    pub rotation: f64, // degrees
    pub skew_x: f64,
    pub skew_y: f64,
}

impl Default for Transform {
    fn default() -> Self {
        Self::identity()
    }
}

impl Transform {
    /// Create an identity transform.
    pub fn identity() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
            rotation: 0.0,
            skew_x: 0.0,
            skew_y: 0.0,
        }
    }

    /// Check if this is an identity transform (no transformation).
    pub fn is_identity(&self) -> bool {
        self.x == 0.0
            && self.y == 0.0
            && self.scale_x == 1.0
            && self.scale_y == 1.0
            && self.rotation == 0.0
            && self.skew_x == 0.0
            && self.skew_y == 0.0
    }
}
