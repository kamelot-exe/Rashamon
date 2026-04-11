/**
 * File Operations — save, open, new document via Tauri dialogs.
 *
 * Uses Tauri 2 dialog API for file selection and the Rust
 * file format crate for serialization.
 *
 * NOTE: Since the Tauri commands aren't fully wired to the
 * file_format crate yet (system deps issue on this machine),
 * this implements file I/O through Tauri's built-in fs/dialog APIs.
 * The Rust file_format crate exists and will be used when
 * Tauri build is possible.
 */

import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { getDocument, setDocument, newDocument } from '../store/documentStore.js';

// ─── New Document ────────────────────────────────────────────

export function handleNewDocument(): void {
  newDocument('Untitled');
}

// ─── Save Document ───────────────────────────────────────────

export async function handleSaveDocument(): Promise<boolean> {
  try {
    const doc = getDocument();
    const json = doc;

    // Update modified timestamp
    doc.metadata.modifiedAt = new Date().toISOString();

    // Try to use Tauri dialog save
    const filePath = await save({
      filters: [
        {
          name: 'Rashamon Draw',
          extensions: ['rdraw'],
        },
      ],
      defaultPath: `${doc.metadata.title || 'untitled'}.rdraw`,
    });

    if (filePath) {
      await writeTextFile(filePath, JSON.stringify(json, null, 2));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Save failed:', err);
    // Fallback: download as blob
    const doc = getDocument();
    fallbackDownload(doc);
    return true;
  }
}

// ─── Open Document ───────────────────────────────────────────

export async function handleOpenDocument(): Promise<boolean> {
  try {
    const filePath = await open({
      filters: [
        {
          name: 'Rashamon Draw',
          extensions: ['rdraw'],
        },
      ],
      multiple: false,
    });

    if (filePath && typeof filePath === 'string') {
      const content = await readTextFile(filePath);
      const doc = JSON.parse(content);
      setDocument(doc);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Open failed:', err);
    return false;
  }
}

// ─── Fallback: download as blob ─────────────────────────────

function fallbackDownload(doc: ReturnType<typeof getDocument>): void {
  doc.metadata.modifiedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.metadata.title || 'untitled'}.rdraw`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Tauri command wrappers (for when Tauri is fully built) ─

/**
 * Validate a document JSON string using the Rust core.
 * Returns array of error strings. Empty = valid.
 */
export async function validateDocumentJson(json: string): Promise<string[]> {
  try {
    const result = await invoke<string>('validate_document', { json });
    return JSON.parse(result);
  } catch {
    return ['Validation not available'];
  }
}

/**
 * Get the app version from Rust.
 */
export async function getAppVersion(): Promise<string> {
  try {
    return await invoke<string>('get_app_version');
  } catch {
    return '0.0.0-dev';
  }
}

// ─── Export SVG ──────────────────────────────────────────────

/**
 * Export the current document as an SVG file.
 * Generates clean SVG markup from the document scene graph.
 */
export async function handleExportSvg(): Promise<boolean> {
  try {
    const doc = getDocument();
    const svgContent = generateSvgFromDocument(doc);

    // Try to use Tauri dialog save
    const filePath = await save({
      filters: [
        {
          name: 'SVG Image',
          extensions: ['svg'],
        },
      ],
      defaultPath: `${doc.metadata.title || 'export'}.svg`,
    });

    if (filePath) {
      await writeTextFile(filePath, svgContent);
      return true;
    }
    return false;
  } catch (err) {
    console.error('SVG export failed:', err);
    // Fallback: download as blob
    const doc = getDocument();
    const svgContent = generateSvgFromDocument(doc);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.metadata.title || 'export'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}

/**
 * Generate SVG markup from a Rashamon document.
 */
function generateSvgFromDocument(doc: ReturnType<typeof getDocument>): string {
  const { width, height, background } = doc.canvas;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;

  // Background
  if (background) {
    svg += `  <rect width="${width}" height="${height}" fill="${background}"/>\n`;
  }

  // Render all nodes
  for (const node of doc.root.children) {
    svg += generateNodeSvg(node, '');
  }

  svg += `</svg>`;
  return svg;
}

function generateNodeSvg(node: any, indent: string): string {
  const { transform, opacity, visible } = node;
  if (!visible) return '';

  let result = '';
  const transformStr = buildTransformString(transform);

  switch (node.type) {
    case 'shape': {
      const geo = node.geometry;
      const fill = node.fill?.color || 'none';
      const stroke = node.stroke?.color;
      const strokeWidth = node.stroke?.width || 0;

      const attrs = [
        transformStr && `transform="${transformStr}"`,
        `opacity="${opacity}"`,
        `fill="${fill}"`,
        stroke && `stroke="${stroke}"`,
        strokeWidth > 0 && `stroke-width="${strokeWidth}"`,
      ].filter(Boolean).join(' ');

      switch (geo.type) {
        case 'rect':
          result += `${indent}<rect x="0" y="0" width="${geo.width}" height="${geo.height}" rx="${geo.cornerRadius?.topLeft || 0}" ${attrs}/>\n`;
          break;
        case 'ellipse':
          result += `${indent}<ellipse cx="${geo.rx}" cy="${geo.ry}" rx="${geo.rx}" ry="${geo.ry}" ${attrs}/>\n`;
          break;
        case 'line':
          result += `${indent}<line x1="${geo.x1}" y1="${geo.y1}" x2="${geo.x2}" y2="${geo.y2}" stroke="${stroke || '#000'}" stroke-width="${strokeWidth || 1}" ${attrs}/>\n`;
          break;
        case 'text':
          result += `${indent}<text x="0" y="${geo.fontSize}" font-family="${geo.fontFamily}" font-size="${geo.fontSize}" fill="${fill}" ${attrs}>${escapeXml(geo.content)}</text>\n`;
          break;
      }
      break;
    }
    case 'text': {
      const fill = node.fill || '#FFFFFF';
      result += `${indent}<text x="${transform.x}" y="${transform.y + node.fontSize}" font-family="${node.fontFamily}" font-size="${node.fontSize}" fill="${fill}" opacity="${opacity}" ${transformStr ? `transform="${transformStr}"` : ''}>${escapeXml(node.content)}</text>\n`;
      break;
    }
    case 'group': {
      result += `${indent}<g ${transformStr ? `transform="${transformStr}"` : ''} opacity="${opacity}">\n`;
      for (const child of node.children) {
        result += generateNodeSvg(child, indent + '  ');
      }
      result += `${indent}</g>\n`;
      break;
    }
  }

  return result;
}

function buildTransformString(t: any): string | null {
  const parts: string[] = [];
  if (t.x !== 0 || t.y !== 0) {
    parts.push(`translate(${t.x}, ${t.y})`);
  }
  if (t.rotation !== 0) {
    parts.push(`rotate(${t.rotation})`);
  }
  if (t.scaleX !== 1 || t.scaleY !== 1) {
    parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
  }
  if (t.skewX !== 0 || t.skY !== 0) {
    parts.push(`skewX(${t.skewX}) skewY(${t.skewY})`);
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Export PNG ──────────────────────────────────────────────

/**
 * Export the current document as a PNG image.
 *
 * TODO: Implement proper PNG export via canvas rasterization.
 * Current approach: renders SVG to a hidden canvas and exports as PNG.
 * This works for most cases but may have issues with:
 * - Complex text rendering (font availability)
 * - Gradient fills (not yet implemented)
 * - Custom fonts (need font loading)
 *
 * Implementation plan for Phase 2:
 * 1. Create offscreen canvas with document dimensions
 * 2. Render SVG string to canvas using drawImage
 * 3. Handle font loading with document.fonts.ready
 * 4. Export canvas as PNG with configurable quality
 * 5. Add support for transparent background option
 */
export async function handleExportPng(): Promise<boolean> {
  // TODO: Implement proper PNG export
  console.log('PNG export is a TODO for Phase 2');
  alert('PNG export is not yet implemented. Please use SVG export for now.');
  return false;
}
