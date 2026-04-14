//! Rashamon Core — shared data model for all Rashamon products.
//!
//! This crate defines the fundamental types used across the application:
//! documents, scene nodes, transforms, geometry, semantic metadata,
//! auto layout, constraints, styles, and components.
//!
//! Keep in sync with `packages/types` TypeScript definitions.

pub mod document;
pub mod scene_graph;
pub mod transform;
pub mod geometry;
pub mod error;
pub mod styles;
pub mod components;
pub mod layout;

pub use document::Document;
pub use error::{CoreError, Result};
pub use scene_graph::{SceneNode, SceneNodeType};
pub use transform::Transform;
pub use geometry::Geometry;
pub use styles::{DocumentStyle, StyleType, ColorStyle, TextStyle, EffectStyle, Effect};
pub use components::ComponentDefinition;
pub use layout::{AutoLayoutConfig, LayoutMode, Constraints, HorizontalConstraint, VerticalConstraint};
