/**
 * LayersPanel — minimal layer list.
 * Icon + name only. Visibility/lock on hover.
 */

import { FC, useEffect, useState } from 'react';
import {
  subscribe,
  getSelectedIds,
  selectNode,
  toggleSelection,
  getFlatNodeList,
  deleteNode,
  deleteSelected,
  toggleVisibility,
  FlatNode,
} from '../store/documentStore.js';
import './LayersPanel.css';

export const LayersPanel: FC = () => {
  const selectedIds = getSelectedIds();
  const flatNodes = getFlatNodeList();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  const layers = flatNodes.slice(1);

  return (
    <div className="layers-panel">
      <div className="layers-panel__header">Layers</div>
      <div className="layers-panel__content">
        {layers.length === 0 ? (
          <div className="layers-panel__empty">No layers</div>
        ) : (
          <ul className="layers-list">
            {layers.map((node) => (
              <LayerItem
                key={node.id}
                node={node}
                isSelected={selectedIds.has(node.id)}
                onSelect={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelection(node.id);
                  else selectNode(node.id);
                }}
                onDelete={() => {
                  if (!selectedIds.has(node.id)) selectNode(node.id);
                  if (selectedIds.size > 1) deleteSelected();
                  else deleteNode(node.id);
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
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
}> = ({ node, isSelected, onSelect, onDelete }) => {
  const [hover, setHover] = useState(false);

  return (
    <li
      className={`layers-item ${isSelected ? 'layers-item--selected' : ''} ${node.type === 'frame' ? 'layers-item--frame' : ''}`}
      style={{ paddingLeft: 8 + node.depth * 14 }}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="layers-item__icon" aria-hidden="true">
        {getTypeIcon(node.type)}
      </span>
      <span className="layers-item__name">{node.name}</span>
      {hover && (
        <>
          <button
            className="layers-item__btn"
            title={node.visible ? 'Hide' : 'Show'}
            onClick={(e) => { e.stopPropagation(); toggleVisibility(node.id); }}
          >
            {node.visible ? '👁' : '👁‍🗨'}
          </button>
          <button
            className="layers-item__btn"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            ✕
          </button>
        </>
      )}
    </li>
  );
};

function getTypeIcon(type: string): string {
  switch (type) {
    case 'frame': return '▣';
    case 'group': return '▤';
    case 'shape': return '▢';
    case 'text': return 'T';
    case 'image': return '▤';
    default: return '•';
  }
}
