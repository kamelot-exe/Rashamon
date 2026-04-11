/**
 * LayersPanel — hierarchical layer list from the scene graph.
 *
 * - Shows all nodes in document order
 * - Selecting a layer selects the object on canvas
 * - Visual indicators for type, visibility
 */

import { FC, useEffect, useState } from 'react';
import {
  subscribe,
  getSelectedId,
  selectNode,
  getFlatNodeList,
  deleteNode,
  FlatNode,
} from '../store/documentStore.js';
import './LayersPanel.css';

export const LayersPanel: FC = () => {
  const selectedId = getSelectedId();
  const flatNodes = getFlatNodeList();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  // Filter out the root node (index 0)
  const layers = flatNodes.slice(1);

  return (
    <div className="layers-panel">
      <div className="layers-panel__header">Layers</div>
      <div className="layers-panel__content">
        {layers.length === 0 ? (
          <div className="layers-panel__empty">
            <p>No layers</p>
            <span>Use a shape tool to create objects</span>
          </div>
        ) : (
          <ul className="layers-list" role="listbox" aria-label="Layers">
            {layers.map((node) => (
              <LayerItem
                key={node.id}
                node={node}
                isSelected={node.id === selectedId}
                onSelect={() => selectNode(node.id === selectedId ? null : node.id)}
                onDelete={() => {
                  if (node.id !== selectedId) selectNode(node.id);
                  deleteNode(node.id);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ─── Layer Item ──────────────────────────────────────────────

const LayerItem: FC<{
  node: FlatNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ node, isSelected, onSelect, onDelete }) => {
  return (
    <li
      className={`layer-item ${isSelected ? 'layer-item--selected' : ''}`}
      style={{ paddingLeft: 8 + node.depth * 16 }}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <span className="layer-item__icon" aria-hidden="true">
        {getTypeIcon(node.type)}
      </span>
      <span className="layer-item__name">{node.name}</span>
      <span className="layer-item__type">{node.type}</span>
      <button
        className="layer-item__delete"
        title="Delete"
        aria-label={`Delete ${node.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </button>
    </li>
  );
};

function getTypeIcon(type: string): string {
  switch (type) {
    case 'group':
      return '📁';
    case 'shape':
      return '◆';
    case 'text':
      return 'T';
    case 'image':
      return '🖼';
    default:
      return '·';
  }
}
