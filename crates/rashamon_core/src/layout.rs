//! Auto Layout and Constraints types.
//!
//! Mirrors the TypeScript AutoLayoutConfig, Constraints, and LayoutOverride types.

use serde::{Deserialize, Serialize};

// ─── Auto Layout ─────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LayoutMode {
    None,
    Horizontal,
    Vertical,
}

impl Default for LayoutMode {
    fn default() -> Self {
        Self::None
    }
}

/// Auto Layout configuration on frame/group nodes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoLayoutConfig {
    pub mode: LayoutMode,
    pub spacing: f64,
    pub padding_top: f64,
    pub padding_right: f64,
    pub padding_bottom: f64,
    pub padding_left: f64,
    pub primary_axis_sizing: AxisSizing,
    pub counter_axis_sizing: AxisSizing,
    pub primary_axis_align: AxisAlign,
    pub counter_axis_align: AxisAlign,
}

impl Default for AutoLayoutConfig {
    fn default() -> Self {
        Self {
            mode: LayoutMode::None,
            spacing: 8.0,
            padding_top: 8.0,
            padding_right: 8.0,
            padding_bottom: 8.0,
            padding_left: 8.0,
            primary_axis_sizing: AxisSizing::Fixed,
            counter_axis_sizing: AxisSizing::Auto,
            primary_axis_align: AxisAlign::Min,
            counter_axis_align: AxisAlign::Min,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AxisSizing {
    Fixed,
    Auto,
    Fill,
}

impl Default for AxisSizing {
    fn default() -> Self {
        Self::Fixed
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AxisAlign {
    Min,
    Center,
    Max,
    SpaceBetween,
}

impl Default for AxisAlign {
    fn default() -> Self {
        Self::Min
    }
}

// ─── Constraints ─────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum HorizontalConstraint {
    Left,
    Right,
    Center,
    LeftRight,
    Scale,
}

impl Default for HorizontalConstraint {
    fn default() -> Self {
        Self::Left
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VerticalConstraint {
    Top,
    Bottom,
    Center,
    TopBottom,
    Scale,
}

impl Default for VerticalConstraint {
    fn default() -> Self {
        Self::Top
    }
}

/// Constraint configuration for a child node within a frame.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Constraints {
    pub horizontal: HorizontalConstraint,
    pub vertical: VerticalConstraint,
}

impl Default for Constraints {
    fn default() -> Self {
        Self {
            horizontal: HorizontalConstraint::default(),
            vertical: VerticalConstraint::default(),
        }
    }
}
