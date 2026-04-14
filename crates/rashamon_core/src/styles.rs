//! Styles system — reusable color, text, and effect styles.
//!
//! Mirrors TypeScript DocumentStyle types.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StyleType {
    Color,
    Text,
    Effect,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum DocumentStyle {
    Color {
        id: String,
        name: String,
        color: String,
        opacity: f64,
        description: Option<String>,
    },
    Text {
        id: String,
        name: String,
        font_family: String,
        font_size: f64,
        font_weight: u32,
        line_height: f64,
        letter_spacing: f64,
        text_align: TextAlign,
        text_decoration: TextDecoration,
        description: Option<String>,
    },
    Effect {
        id: String,
        name: String,
        effects: Vec<Effect>,
        description: Option<String>,
    },
}

impl DocumentStyle {
    pub fn id(&self) -> &str {
        match self {
            DocumentStyle::Color { id, .. }
            | DocumentStyle::Text { id, .. }
            | DocumentStyle::Effect { id, .. } => id,
        }
    }

    pub fn name(&self) -> &str {
        match self {
            DocumentStyle::Color { name, .. }
            | DocumentStyle::Text { name, .. }
            | DocumentStyle::Effect { name, .. } => name,
        }
    }

    pub fn style_type(&self) -> StyleType {
        match self {
            DocumentStyle::Color { .. } => StyleType::Color,
            DocumentStyle::Text { .. } => StyleType::Text,
            DocumentStyle::Effect { .. } => StyleType::Effect,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TextAlign {
    Left,
    Center,
    Right,
    Justify,
}

impl Default for TextAlign {
    fn default() -> Self {
        Self::Left
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TextDecoration {
    None,
    Underline,
    LineThrough,
}

impl Default for TextDecoration {
    fn default() -> Self {
        Self::None
    }
}

/// Visual effect (shadow, blur, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    #[serde(rename = "type")]
    pub effect_type: EffectType,
    pub visible: bool,
    pub radius: f64,
    pub offset_x: Option<f64>,
    pub offset_y: Option<f64>,
    pub spread: Option<f64>,
    pub color: String,
    pub opacity: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EffectType {
    DropShadow,
    InnerShadow,
    LayerBlur,
    BackgroundBlur,
}
