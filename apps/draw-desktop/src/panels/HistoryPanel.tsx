/**
 * HistoryPanel — minimal history/branching visibility.
 *
 * Shows:
 * - Current history depth
 * - Total history nodes
 * - Branch point count
 * - Whether on main branch
 * - Undo/redo buttons with state
 *
 * This is a developer-facing / early-product UI.
 * Not the final graph visualization.
 */

import { FC, useEffect, useState } from 'react';
import {
  subscribe,
  canUndo,
  canRedo,
  undo,
  redo,
  getHistoryStatsExport,
} from '../store/documentStore.js';
import './HistoryPanel.css';

export const HistoryPanel: FC = () => {
  const [canUndoState, setCanUndo] = useState(false);
  const [canRedoState, setCanRedo] = useState(false);
  const [stats, setStats] = useState({ depth: 0, branchPoints: 0, isOnMainBranch: true, totalNodes: 1 });
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => {
      setCanUndo(canUndo());
      setCanRedo(canRedo());
      setStats(getHistoryStatsExport());
      forceUpdate((n) => n + 1);
    });
  }, []);

  return (
    <div className="history-panel">
      <div className="history-panel__header">History</div>
      <div className="history-panel__content">
        {/* Navigation */}
        <div className="history-nav">
          <button
            className="history-nav__btn"
            onClick={() => undo()}
            disabled={!canUndoState}
            title="Undo (Ctrl+Z)"
          >
            ← Undo
          </button>
          <button
            className="history-nav__btn"
            onClick={() => redo()}
            disabled={!canRedoState}
            title="Redo (Ctrl+Y)"
          >
            Redo →
          </button>
        </div>

        {/* Stats */}
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat__label">Depth</span>
            <span className="history-stat__value">{stats.depth}</span>
          </div>
          <div className="history-stat">
            <span className="history-stat__label">Nodes</span>
            <span className="history-stat__value">{stats.totalNodes}</span>
          </div>
          <div className="history-stat">
            <span className="history-stat__label">Branches</span>
            <span className="history-stat__value">{stats.branchPoints}</span>
          </div>
        </div>

        {/* Branch indicator */}
        <div className={`history-branch ${!stats.isOnMainBranch ? 'history-branch--forked' : ''}`}>
          <span className="history-branch__icon" aria-hidden="true">
            {stats.isOnMainBranch ? '┃' : '┣'}
          </span>
          <span className="history-branch__text">
            {stats.isOnMainBranch ? 'Main branch' : 'Forked branch'}
          </span>
        </div>
      </div>
    </div>
  );
};
