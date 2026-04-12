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
import type { ShapeSceneNode, TextSceneNode, RectGeometry, EllipseGeometry, LineGeometry } from '@rashamon/types';
import { subscribe, getSelectedId, getSelectedNode, updateTransform, updateNodeName, updateTextContent, updateTextProperties, updateFill, updateStroke } from '../store/documentStore.js';
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

  // Text node editing
  if (selectedNode.type === 'text') {
    const textNode = selectedNode as TextSceneNode;
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
              value={textNode.name}
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
                  value={Math.round(textNode.transform.x)}
                  onChange={(e) =>
                    updateTransform(selectedId, { ...textNode.transform, x: Number(e.target.value) })
                  }
                />
              </div>
              <div className="prop-field">
                <span className="prop-field__label">Y</span>
                <input
                  className="prop-input prop-input--small"
                  type="number"
                  value={Math.round(textNode.transform.y)}
                  onChange={(e) =>
                    updateTransform(selectedId, { ...textNode.transform, y: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="prop-group">
            <label className="prop-label">Content</label>
            <textarea
              className="prop-input prop-input--textarea"
              value={textNode.content}
              onChange={(e) => updateTextContent(selectedId, e.target.value)}
              rows={3}
            />
          </div>

          {/* Font size */}
          <div className="prop-group">
            <label className="prop-label">Font Size</label>
            <div className="prop-row">
              <div className="prop-field">
                <input
                  className="prop-input prop-input--small"
                  type="number"
                  value={textNode.fontSize}
                  onChange={(e) =>
                    updateTextProperties(selectedId, { fontSize: Number(e.target.value) })
                  }
                />
                <span className="prop-field__unit">px</span>
              </div>
            </div>
          </div>

          {/* Font family */}
          <div className="prop-group">
            <label className="prop-label">Font</label>
            <input
              className="prop-input"
              type="text"
              value={textNode.fontFamily}
              onChange={(e) =>
                updateTextProperties(selectedId, { fontFamily: e.target.value })
              }
            />
          </div>

          {/* Fill color */}
          <div className="prop-group">
            <label className="prop-label">Color</label>
            <div className="prop-row">
              <input
                className="prop-input"
                type="color"
                value={textNode.fill}
                onChange={(e) =>
                  updateTextProperties(selectedId, { fill: e.target.value })
                }
                style={{ width: '40px', height: '30px', padding: '2px' }}
              />
              <span className="prop-value">{textNode.fill}</span>
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
                  value={Math.round(textNode.transform.rotation)}
                  onChange={(e) =>
                    updateTransform(selectedId, {
                      ...textNode.transform,
                      rotation: Number(e.target.value),
                    })
                  }
                />
                <span className="prop-field__unit">deg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group nodes
  if (selectedNode.type === 'group') {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">Properties</div>
        <div className="properties-panel__content">
          <p>Group (editing not yet supported)</p>
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
          <div className="prop-row" style={{ alignItems: 'center', gap: '8px' }}>
            <input
              className="prop-input"
              type="color"
              value={shape.fill?.color ?? '#000000'}
              onChange={(e) =>
                updateFill(selectedId, shape.fill ? { ...shape.fill, color: e.target.value } : { type: 'solid', color: e.target.value })
              }
              style={{ width: '36px', height: '28px', padding: '1px', cursor: 'pointer' }}
            />
            <input
              className="prop-input"
              type="text"
              value={shape.fill?.color ?? 'none'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'none' || val === 'transparent') {
                  updateFill(selectedId, null);
                } else {
                  updateFill(selectedId, shape.fill ? { ...shape.fill, color: val } : { type: 'solid', color: val });
                }
              }}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Stroke */}
        <div className="prop-group">
          <label className="prop-label">Stroke</label>
          <div className="prop-row" style={{ alignItems: 'center', gap: '8px' }}>
            <input
              className="prop-input"
              type="color"
              value={shape.stroke?.color ?? '#000000'}
              onChange={(e) =>
                updateStroke(selectedId, shape.stroke ? { ...shape.stroke, color: e.target.value } : { color: e.target.value, width: 1, lineCap: 'butt', lineJoin: 'miter' })
              }
              style={{ width: '36px', height: '28px', padding: '1px', cursor: 'pointer' }}
            />
            <input
              className="prop-input prop-input--small"
              type="number"
              value={shape.stroke?.width ?? 0}
              min={0}
              max={50}
              onChange={(e) => {
                const w = Number(e.target.value);
                if (w <= 0) {
                  updateStroke(selectedId, null);
                } else {
                  updateStroke(selectedId, shape.stroke ? { ...shape.stroke, width: w } : { color: '#000000', width: w, lineCap: 'butt', lineJoin: 'miter' });
                }
              }}
              style={{ width: '50px' }}
            />
            <span className="prop-value" style={{ fontSize: '11px' }}>px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
