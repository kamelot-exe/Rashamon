//! Geometry types for scene nodes.

use serde::{Deserialize, Serialize};

/// Supported geometry types.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Geometry {
    Rect {
        width: f64,
        height: f64,
        #[serde(default)]
        corner_radius: Option<CornerRadius>,
    },
    Ellipse {
        rx: f64,
        ry: f64,
    },
    Line {
        x1: f64,
        y1: f64,
        x2: f64,
        y2: f64,
    },
    Path {
        commands: Vec<PathCommand>,
    },
    Polygon {
        points: Vec<(f64, f64)>,
    },
}

/// Corner radius for rectangles.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CornerRadius {
    pub top_left: f64,
    pub top_right: f64,
    pub bottom_left: f64,
    pub bottom_right: f64,
}

/// A single path command (M, L, C, Z, etc.).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathCommand {
    pub cmd: String,    // "M", "L", "C", "Z", etc.
    pub params: Vec<f64>,
}

impl Geometry {
    /// Returns the bounding box of this geometry as (min_x, min_y, max_x, max_y).
    pub fn bounds(&self) -> (f64, f64, f64, f64) {
        match self {
            Geometry::Rect { width, height, .. } => (0.0, 0.0, *width, *height),
            Geometry::Ellipse { rx, ry } => (-*rx, -*ry, *rx, *ry),
            Geometry::Line { x1, y1, x2, y2 } => {
                (x1.min(*x2), y1.min(*y2), x1.max(*x2), y1.max(*y2))
            }
            Geometry::Path { commands } => {
                let mut min_x = f64::MAX;
                let mut min_y = f64::MAX;
                let mut max_x = f64::MIN;
                let mut max_y = f64::MIN;
                for cmd in commands {
                    for chunk in cmd.params.chunks(2) {
                        if chunk.len() == 2 {
                            min_x = min_x.min(chunk[0]);
                            min_y = min_y.min(chunk[1]);
                            max_x = max_x.max(chunk[0]);
                            max_y = max_y.max(chunk[1]);
                        }
                    }
                }
                if min_x == f64::MAX {
                    (0.0, 0.0, 0.0, 0.0)
                } else {
                    (min_x, min_y, max_x, max_y)
                }
            }
            Geometry::Polygon { points } => {
                if points.is_empty() {
                    return (0.0, 0.0, 0.0, 0.0);
                }
                let mut min_x = f64::MAX;
                let mut min_y = f64::MAX;
                let mut max_x = f64::MIN;
                let mut max_y = f64::MIN;
                for (x, y) in points {
                    min_x = min_x.min(*x);
                    min_y = min_y.min(*y);
                    max_x = max_x.max(*x);
                    max_y = max_y.max(*y);
                }
                (min_x, min_y, max_x, max_y)
            }
        }
    }
}
