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
