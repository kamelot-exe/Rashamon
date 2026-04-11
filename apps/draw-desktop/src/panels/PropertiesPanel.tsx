/**
 * PropertiesPanel — inspector for the selected node.
 *
 * Shows and edits:
 * - name
 * - x, y (position)
 * - width, height (for rect shapes)
 * - rotation
 *
 * Changes update the document store immediately.
 */

import { FC, useEffect, useState } from 'react';
import type { ShapeSceneNode, RectGeometry, EllipseGeometry, LineGeometry } from '@rashamon/types';
import { subscribe, getSelectedId, getSelectedNode, updateTransform, updateNodeName } from '../store/documentStore.js';
import './PropertiesPanel.css';

export const PropertiesPanel: FC = () => {
  const selectedId = getSelectedId();
  const selectedNode = getSelectedNode();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  if (!selectedId || !selectedNode) {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">Properties</div>
        <div className="properties-panel__content">
          <div className="properties-panel__empty">
            <p>No selection</p>
            <span>Select an object to edit properties</span>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type !== 'shape') {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">Properties</div>
        <div className="properties-panel__content">
          <p>{selectedNode.type} (editing not yet supported)</p>
        </div>
      </div>
    );
  }

  const shape = selectedNode as ShapeSceneNode;
  const { x, y, rotation } = shape.transform;

  let width = 0, height = 0;
  const geo = shape.geometry;

  if (geo.type === 'rect') {
    const r = geo as RectGeometry;
    width = r.width;
    height = r.height;
  } else if (geo.type === 'ellipse') {
    const e = geo as EllipseGeometry;
    width = e.rx * 2;
    height = e.ry * 2;
  } else if (geo.type === 'line') {
    const l = geo as LineGeometry;
    width = Math.abs(l.x2 - l.x1);
    height = Math.abs(l.y2 - l.y1);
  }

  return (
    <div className="properties-panel">
      <div className="properties-panel__header">Properties</div>
      <div className="properties-panel__content">
        {/* Name */}
        <div className="prop-group">
          <label className="prop-label">Name</label>
          <input
            className="prop-input"
            type="text"
            value={shape.name}
            onChange={(e) => updateNodeName(selectedId, e.target.value)}
          />
        </div>

        {/* Position */}
        <div className="prop-group">
          <label className="prop-label">Position</label>
          <div className="prop-row">
            <div className="prop-field">
              <span className="prop-field__label">X</span>
              <input
                className="prop-input prop-input--small"
                type="number"
                value={Math.round(x)}
                onChange={(e) =>
                  updateTransform(selectedId, { ...shape.transform, x: Number(e.target.value) })
                }
              />
            </div>
            <div className="prop-field">
              <span className="prop-field__label">Y</span>
              <input
                className="prop-input prop-input--small"
                type="number"
                value={Math.round(y)}
                onChange={(e) =>
                  updateTransform(selectedId, { ...shape.transform, y: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="prop-group">
          <label className="prop-label">Size</label>
          <div className="prop-row">
            <div className="prop-field">
              <span className="prop-field__label">W</span>
              <input
                className="prop-input prop-input--small"
                type="number"
                value={Math.round(width)}
                onChange={(e) => {
                  if (geo.type === 'rect') {
                    (geo as RectGeometry).width = Number(e.target.value);
                    subscribe(() => {})(); // trigger re-render via store
                    forceUpdate((n) => n + 1);
                  }
                }}
                onBlur={() => subscribe(() => {})()}
              />
            </div>
            <div className="prop-field">
              <span className="prop-field__label">H</span>
              <input
                className="prop-input prop-input--small"
                type="number"
                value={Math.round(height)}
                onChange={(e) => {
                  if (geo.type === 'rect') {
                    (geo as RectGeometry).height = Number(e.target.value);
                    forceUpdate((n) => n + 1);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div className="prop-group">
          <label className="prop-label">Rotation</label>
          <div className="prop-row">
            <div className="prop-field">
              <input
                className="prop-input prop-input--full"
                type="number"
                value={Math.round(rotation)}
                onChange={(e) =>
                  updateTransform(selectedId, {
                    ...shape.transform,
                    rotation: Number(e.target.value),
                  })
                }
              />
              <span className="prop-field__unit">deg</span>
            </div>
          </div>
        </div>

        {/* Geometry type info */}
        <div className="prop-group">
          <label className="prop-label">Type</label>
          <span className="prop-value">{geo.type}</span>
        </div>

        {/* Fill */}
        <div className="prop-group">
          <label className="prop-label">Fill</label>
          <div className="prop-row">
            {shape.fill ? (
              <div className="color-swatch" style={{ backgroundColor: shape.fill.color }} />
            ) : (
              <span className="prop-value">none</span>
            )}
          </div>
        </div>

        {/* Stroke */}
        <div className="prop-group">
          <label className="prop-label">Stroke</label>
          <div className="prop-row">
            {shape.stroke ? (
              <>
                <div className="color-swatch" style={{ backgroundColor: shape.stroke.color }} />
                <span className="prop-value">{shape.stroke.width}px</span>
              </>
            ) : (
              <span className="prop-value">none</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
