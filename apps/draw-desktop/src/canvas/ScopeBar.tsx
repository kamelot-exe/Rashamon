/**
 * ScopeBar — breadcrumb bar showing current edit scope.
 *
 * Shows:
 * - Current scope path (root → Group Name)
 * - Exit button when inside a group
 * - Double-click hint for entering groups
 *
 * When at root level, shows a minimal "Root" indicator.
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
  const [scopeGroupId, setScopeGroupId] = useState<string | null>(null);
  const [scopeName, setScopeName] = useState<string>('Root');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => {
      setScopeGroupId(getEditScopeGroupId());
      const group = getEditScopeGroup();
      setScopeName(group?.name ?? 'Root');
      forceUpdate((n) => n + 1);
    });
  }, []);

  if (!scopeGroupId) {
    return (
      <div className="scope-bar">
        <span className="scope-bar__root">📄 Root</span>
        <span className="scope-bar__hint">Double-click a group to enter</span>
      </div>
    );
  }

  return (
    <div className="scope-bar scope-bar--active">
      <div className="scope-bar__path">
        <span className="scope-bar__root">📄 Root</span>
        <span className="scope-bar__separator">›</span>
        <span className="scope-bar__current">{scopeName}</span>
      </div>
      <button
        className="scope-bar__exit"
        onClick={() => exitGroup()}
        title="Exit to parent scope (Esc)"
      >
        ↑ Exit
      </button>
    </div>
  );
};
