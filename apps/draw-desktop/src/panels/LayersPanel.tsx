/**
 * LayersPanel — hierarchical layer list from the scene graph.
 *
 * - Shows all nodes in document order
 * - Selecting a layer selects the object on canvas
 * - Clean icon-first items with proper visual hierarchy
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

  // Filter out the root node (index 0)
  const layers = flatNodes.slice(1);

  return (
    <div className="layers-panel">
      <div className="layers-panel__header">
        <span>Layers</span>
        <span className="layers-panel__count">{layers.length}</span>
      </div>
      <div className="layers-panel__content">
        {layers.length === 0 ? (
          <div className="layers-panel__empty">
            <p>No layers yet</p>
            <span>Use a shape tool to create objects</span>
          </div>
        ) : (
          <ul className="layers-list" role="listbox" aria-label="Layers">
            {layers.map((node) => (
              <LayerItem
                key={node.id}
                node={node}
                isSelected={selectedIds.has(node.id)}
                onSelect={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    toggleSelection(node.id);
                  } else {
                    selectNode(node.id);
                  }
                }}
                onDelete={() => {
                  if (!selectedIds.has(node.id)) selectNode(node.id);
                  if (selectedIds.size > 1) {
                    deleteSelected();
                  } else {
                    deleteNode(node.id);
                  }
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
  return (
    <li
      className={`layer-item ${isSelected ? 'layer-item--selected' : ''} ${node.type === 'frame' ? 'frame-item' : ''}`}
      style={{ paddingLeft: 8 + node.depth * 16 }}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <span className="layer-item__icon" aria-hidden="true">
        {getTypeIconSvg(node.type)}
      </span>
      <span className="layer-item__name">{node.name}</span>
      {node.semanticRole && typeof node.semanticRole === 'string' && (
        <span className="layer-item__role" title={`Role: ${node.semanticRole}`}>{getRoleIcon(node.semanticRole)}</span>
      )}
      <button
        className="layer-item__delete"
        title="Delete"
        aria-label={`Delete ${node.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
};

function getTypeIconSvg(type: string): React.ReactNode {
  switch (type) {
    case 'frame':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" strokeWidth="1.4" />
        </svg>
      );
    case 'group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 7v10h18V7H3z" />
        </svg>
      );
    case 'shape':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case 'text':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
      );
    case 'image':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
  }
}

function getRoleIcon(role: string): string {
  switch (role) {
    case 'background': return '🖼';
    case 'foreground': return '🔝';
    case 'annotation': return '💬';
    case 'guide': return '📐';
    default: return '';
  }
}
