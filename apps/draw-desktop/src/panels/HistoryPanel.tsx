/**
 * HistoryPanel — minimal, collapsible history/branching visibility.
 *
 * Shows:
 * - Undo/redo buttons
 * - Minimal branch indicator (only when forked)
 *
 * Collapsed by default. Expand via header click.
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
  const [collapsed, setCollapsed] = useState(true);
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
      <button
        className="history-panel__header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>History</span>
        <svg
          className={`history-panel__chevron ${collapsed ? '' : 'history-panel__chevron--open'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="history-panel__content">
          {/* Navigation */}
          <div className="history-nav">
            <button
              className="history-nav__btn"
              onClick={() => undo()}
              disabled={!canUndoState}
              title="Undo (Ctrl+Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 10h10a5 5 0 0 1 0 10H9" />
                <path d="M7 6L3 10l4 4" />
              </svg>
            </button>
            <button
              className="history-nav__btn"
              onClick={() => redo()}
              disabled={!canRedoState}
              title="Redo (Ctrl+Y)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 10H11a5 5 0 0 0 0 10h4" />
                <path d="M17 6l4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* Branch indicator (only when forked) */}
          {!stats.isOnMainBranch && (
            <div className="history-branch history-branch--forked">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="6" r="2" />
                <path d="M12 8v4" />
                <path d="M12 12l-4 6" />
                <path d="M12 12l4 6" />
                <circle cx="8" cy="18" r="2" />
                <circle cx="16" cy="18" r="2" />
              </svg>
              <span>Forked branch</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
