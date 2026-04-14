/**
 * ScopeBar — minimal scope indicator.
 */

import { FC, useEffect, useState } from 'react';
import { subscribe, getEditScopeGroupId, getEditScopeGroup, exitGroup } from '../store/documentStore.js';
import './ScopeBar.css';

export const ScopeBar: FC = () => {
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [scopeName, setScopeName] = useState('');
  const [scopeType, setScopeType] = useState('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => {
      setScopeId(getEditScopeGroupId());
      const c = getEditScopeGroup();
      setScopeName(c?.name ?? '');
      setScopeType(c?.type ?? '');
      forceUpdate((n) => n + 1);
    });
  }, []);

  if (!scopeId) return null;

  return (
    <div className="scope-bar">
      <span className="scope-bar__type">{scopeType}</span>
      <span className="scope-bar__name">{scopeName}</span>
      <button className="scope-bar__exit" onClick={() => exitGroup()} title="Exit (Esc)">✕</button>
    </div>
  );
};
