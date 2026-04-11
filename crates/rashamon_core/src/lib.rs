//! Rashamon Core — shared data model for all Rashamon products.
//!
//! This crate defines the fundamental types used across the application:
//! documents, scene nodes, transforms, geometry, and semantic metadata.
//!
//! Keep in sync with `packages/types` TypeScript definitions.

pub mod document;
pub mod scene_graph;
pub mod transform;
pub mod geometry;
pub mod error;

pub use document::Document;
pub use error::{CoreError, Result};
pub use scene_graph::{SceneNode, SceneNodeType};
pub use transform::Transform;
pub use geometry::Geometry;
