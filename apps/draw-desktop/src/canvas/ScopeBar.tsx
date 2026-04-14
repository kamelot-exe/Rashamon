/**
 * ScopeBar — breadcrumb bar showing current edit scope.
 *
 * Shows:
 * - Current scope path (Root > Frame/Group Name)
 * - Exit button when inside a container
 *
 * Integrated into canvas area.
 */

import { FC, useEffect, useState } from 'react';
import {
  subscribe,
  getEditScopeGroupId,
  getEditScopeGroup,
  exitGroup,
} from '../store/documentStore.js';
import './ScopeBar.css';

export const ScopeBar: FC = () => {
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [scopeName, setScopeName] = useState<string>('Root');
  const [scopeType, setScopeType] = useState<string>('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => {
      setScopeId(getEditScopeGroupId());
      const container = getEditScopeGroup();
      setScopeName(container?.name ?? 'Root');
      setScopeType(container?.type ?? '');
      forceUpdate((n) => n + 1);
    });
  }, []);

  if (!scopeId) {
    return null;
  }

  return (
    <div className="scope-bar scope-bar--active">
      <div className="scope-bar__path">
        <span className="scope-bar__root">Root</span>
        <span className="scope-bar__separator">/</span>
        <span className="scope-bar__type-badge">{scopeType}</span>
        <span className="scope-bar__current">{scopeName}</span>
      </div>
      <button
        className="scope-bar__exit"
        onClick={() => exitGroup()}
        title="Exit to parent scope (Esc)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        Exit
      </button>
    </div>
  );
};
