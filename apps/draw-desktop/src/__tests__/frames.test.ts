/**
 * Frame workflow tests.
 *
 * Tests:
 * - frame creation
 * - frame containment (addNodeToParent)
 * - moving frame with children (via transform update)
 * - serialization/deserialization
 * - scoped editing (enterContainer/exitContainer)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  addFrameNode,
  addShapeNode,
  addNodeToParent,
  getDocument,
  findNode,
  findNodeWithParent,
  getScopedNodes,
  enterContainer,
  exitContainer,
  getEditScopeGroupId,
  updateTransform,
  resetStore,
  selectNode,
  getSelectedId,
} from '../store/documentStore.js';
import type { FrameSceneNode, RectGeometry } from '@rashamon/types';

describe('Frame creation', () => {
  beforeEach(() => resetStore());

  it('creates a frame with correct properties', () => {
    const id = addFrameNode(800, 600, 'TestFrame', '#FFFFFF', { x: 100, y: 200 });
    const node = findNode(getDocument().root, id);

    expect(node).not.toBeNull();
    expect(node!.type).toBe('frame');

    const frame = node as FrameSceneNode;
    expect(frame.width).toBe(800);
    expect(frame.height).toBe(600);
    expect(frame.name).toBe('TestFrame');
    expect(frame.background).toBe('#FFFFFF');
    expect(frame.transform.x).toBe(100);
    expect(frame.transform.y).toBe(200);
    expect(frame.clipContent).toBe(false);
    expect(frame.children).toEqual([]);
  });

  it('selects the newly created frame', () => {
    const id = addFrameNode(800, 600);
    expect(getSelectedId()).toBe(id);
  });
});

describe('Frame containment', () => {
  beforeEach(() => resetStore());

  it('places a shape inside a frame via addNodeToParent', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    const geo: RectGeometry = { type: 'rect', width: 100, height: 100 };

    // Reset selection first
    selectNode(null);

    const shapeId = addShapeNode(geo, 'Box', { type: 'solid', color: '#ff0000' }, null, { x: 50, y: 50 });
    const shapeNode = findNode(getDocument().root, shapeId);
    expect(shapeNode).not.toBeNull();

    // Move shape into frame
    const frame = findNode(getDocument().root, frameId) as FrameSceneNode;
    addNodeToParent(shapeNode!, frameId);

    // Verify shape is now in frame's children
    expect(frame.children.some((c) => c.id === shapeId)).toBe(true);
  });

  it('finds frame as parent of contained node', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    selectNode(null);
    const geo: RectGeometry = { type: 'rect', width: 50, height: 50 };
    const shapeId = addShapeNode(geo, 'Box', { type: 'solid', color: '#00ff00' }, null, { x: 10, y: 10 });
    const shapeNode = findNode(getDocument().root, shapeId)!;
    addNodeToParent(shapeNode, frameId);

    const result = findNodeWithParent(getDocument().root, shapeId);
    expect(result).not.toBeNull();
    expect(result!.parent.id).toBe(frameId);
  });
});

describe('Moving frame with children', () => {
  beforeEach(() => resetStore());

  it('frame transform update does not affect child relative positions', () => {
    const frameId = addFrameNode(800, 600, 'Frame', '#FFFFFF', { x: 0, y: 0 });
    selectNode(null);
    const geo: RectGeometry = { type: 'rect', width: 50, height: 50 };
    const shapeId = addShapeNode(geo, 'Box', { type: 'solid', color: '#0000ff' }, null, { x: 100, y: 100 });
    const shapeNode = findNode(getDocument().root, shapeId)!;
    addNodeToParent(shapeNode, frameId);

    // Move frame
    updateTransform(frameId, { x: 50, y: 50 });

    const frame = findNode(getDocument().root, frameId) as FrameSceneNode;
    const child = findNode(frame, shapeId)!;

    // Frame moved, child's local transform unchanged
    expect(frame.transform.x).toBe(50);
    expect(frame.transform.y).toBe(50);
    expect(child.transform.x).toBe(100);
    expect(child.transform.y).toBe(100);
  });
});

describe('Frame serialization', () => {
  beforeEach(() => resetStore());

  it('serializes and deserializes frame correctly', () => {
    const frameId = addFrameNode(1440, 900, 'Desktop', '#F5F5F5', { x: 100, y: 50 });

    // Serialize
    const doc = getDocument();
    const json = JSON.stringify(doc);

    // Deserialize
    const restored = JSON.parse(json);
    const frame = findNode(restored.root, frameId);

    expect(frame).not.toBeNull();
    expect(frame!.type).toBe('frame');
    expect((frame as FrameSceneNode).width).toBe(1440);
    expect((frame as FrameSceneNode).height).toBe(900);
    expect((frame as FrameSceneNode).background).toBe('#F5F5F5');
    expect((frame as FrameSceneNode).clipContent).toBe(false);
  });

  it('serializes frame with children', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    selectNode(null);
    const geo: RectGeometry = { type: 'rect', width: 200, height: 100 };
    const childId = addShapeNode(geo, 'Child', { type: 'solid', color: '#ff0000' }, null, { x: 50, y: 50 });
    const childNode = findNode(getDocument().root, childId)!;
    addNodeToParent(childNode, frameId);

    const json = JSON.stringify(getDocument());
    const restored = JSON.parse(json);
    const frame = findNode(restored.root, frameId) as FrameSceneNode;

    expect(frame.children.length).toBe(1);
    expect(frame.children[0].id).toBe(childId);
  });
});

describe('Frame scoped editing', () => {
  beforeEach(() => resetStore());

  it('enterContainer works with frames', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    const result = enterContainer(frameId);
    expect(result).toBe(true);
    expect(getEditScopeGroupId()).toBe(frameId);
  });

  it('getScopedNodes returns frame children when scoped', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    selectNode(null);
    const geo: RectGeometry = { type: 'rect', width: 100, height: 100 };
    const childId = addShapeNode(geo, 'Child', { type: 'solid', color: '#00ff00' }, null, { x: 10, y: 10 });
    const childNode = findNode(getDocument().root, childId)!;
    addNodeToParent(childNode, frameId);

    enterContainer(frameId);
    const scoped = getScopedNodes();

    expect(scoped.length).toBe(1);
    expect(scoped[0].id).toBe(childId);
  });

  it('exitContainer returns to root', () => {
    const frameId = addFrameNode(800, 600, 'Frame');
    enterContainer(frameId);
    expect(getEditScopeGroupId()).toBe(frameId);

    exitContainer();
    expect(getEditScopeGroupId()).toBeNull();
  });
});
