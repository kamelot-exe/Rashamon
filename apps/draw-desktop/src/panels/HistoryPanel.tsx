/**
 * HistoryPanel — minimal, hidden by default.
 */

import { FC, useEffect, useState } from 'react';
import { subscribe, canUndo, canRedo, undo, redo } from '../store/documentStore.js';
import './HistoryPanel.css';

export const HistoryPanel: FC = () => {
  const [canUndoState, setCanUndo] = useState(false);
  const [canRedoState, setCanRedo] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => {
      setCanUndo(canUndo());
      setCanRedo(canRedo());
      forceUpdate((n) => n + 1);
    });
  }, []);

  return (
    <div className="history-panel">
      <button className="history-panel__btn" onClick={() => undo()} disabled={!canUndoState} title="Undo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
          <path d="M3 10h10a5 5 0 0 1 0 10H9" /><path d="M7 6L3 10l4 4" />
        </svg>
      </button>
      <button className="history-panel__btn" onClick={() => redo()} disabled={!canRedoState} title="Redo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
          <path d="M21 10H11a5 5 0 0 0 0 10h4" /><path d="M17 6l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
};
