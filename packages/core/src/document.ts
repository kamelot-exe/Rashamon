import type {
  RashamonDocument,
  DocumentMetadata,
  GroupSceneNode,
  NodeId,
} from '@rashamon/types';
import { defaultCanvasConfig } from '@rashamon/types';
import { generateId } from './utils.js';

/**
 * Create a new empty Rashamon document.
 */
export function createDocument(title: string = 'Untitled'): RashamonDocument {
  const now = new Date().toISOString();
  const rootId = generateId() as NodeId;

  const metadata: DocumentMetadata = {
    title,
    author: '',
    description: '',
    tags: [],
    createdAt: now,
    modifiedAt: now,
  };

  const root: GroupSceneNode = {
    id: rootId,
    name: 'Root',
    type: 'group',
    children: [],
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
    visible: true,
    locked: false,
    opacity: 1,
    semanticTags: [],
  };

  return {
    id: generateId(),
    version: '0.0.0',
    metadata,
    canvas: defaultCanvasConfig(),
    root,
    styles: [],
    components: [],
  };
}

/**
 * Validate a Rashamon document structure.
 * Returns an array of error messages. Empty array means valid.
 */
export function validateDocument(doc: unknown): string[] {
  const errors: string[] = [];

  if (typeof doc !== 'object' || doc === null) {
    return ['Document is not an object'];
  }

  const document = doc as Record<string, unknown>;

  // Required top-level fields
  if (!document.id || typeof document.id !== 'string') {
    errors.push('Missing or invalid "id"');
  }
  if (!document.version || typeof document.version !== 'string') {
    errors.push('Missing or invalid "version"');
  }
  if (!document.metadata || typeof document.metadata !== 'object') {
    errors.push('Missing "metadata"');
  }
  if (!document.canvas || typeof document.canvas !== 'object') {
    errors.push('Missing "canvas"');
  }
  if (!document.root || typeof document.root !== 'object') {
    errors.push('Missing "root"');
  }

  // Canvas validation
  const canvas = document.canvas as Record<string, unknown> | undefined;
  if (canvas) {
    if (typeof canvas.width !== 'number' || canvas.width <= 0) {
      errors.push('Invalid canvas width');
    }
    if (typeof canvas.height !== 'number' || canvas.height <= 0) {
      errors.push('Invalid canvas height');
    }
  }

  // Root node validation
  const root = document.root as Record<string, unknown> | undefined;
  if (root) {
    if (root.type !== 'group') {
      errors.push('Root node must be a group');
    }
    if (!Array.isArray(root.children)) {
      errors.push('Root node must have children array');
    }
  }

  return errors;
}
