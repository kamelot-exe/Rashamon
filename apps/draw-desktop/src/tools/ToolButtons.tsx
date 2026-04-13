/**
 * ToolButtons — icon-only tool selector for the left sidebar.
 * Clean, minimal, professional design.
 */

import { FC, useEffect, useState } from 'react';
import { getActiveTool, setActiveTool, ToolType, subscribeTool } from '../tools/toolSystem.js';
import './ToolButtons.css';

interface ToolDef {
  type: ToolType;
  icon: string;
  label: string;
  shortcut: string;
}

const DRAW_TOOLS: ToolDef[] = [
  { type: 'select', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z', label: 'Select', shortcut: 'V' },
  { type: 'hand', icon: 'M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10V5a2 2 0 0 0-4 0v11l-1.3-2.5a2 2 0 0 0-3.4 1.9L4 22h12l2-8a2 2 0 0 0-4 0', label: 'Hand / Pan', shortcut: 'H' },
];

const SHAPE_TOOLS: ToolDef[] = [
  { type: 'rectangle', icon: 'M3 7v10h18V7H3z', label: 'Rectangle', shortcut: 'R' },
  { type: 'ellipse', icon: 'M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z', label: 'Ellipse', shortcut: 'E' },
  { type: 'line', icon: 'M5 19L19 5', label: 'Line', shortcut: 'L' },
  { type: 'text', icon: 'M4 7V4h16v3M9 20h6M12 4v16', label: 'Text', shortcut: 'T' },
];

export const ToolButtons: FC = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeTool(() => forceUpdate((n) => n + 1));
  }, []);

  const active = getActiveTool();

  const renderTool = (tool: ToolDef) => (
    <button
      key={tool.type}
      className={`tool-btn ${active === tool.type ? 'tool-btn--active' : ''}`}
      title={`${tool.label} (${tool.shortcut})`}
      aria-label={tool.label}
      aria-pressed={active === tool.type}
      onClick={() => setActiveTool(tool.type)}
    >
      <svg
        className="tool-btn__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={tool.icon} />
      </svg>
    </button>
  );

  return (
    <div className="tool-buttons" role="toolbar" aria-label="Drawing tools">
      {DRAW_TOOLS.map(renderTool)}
      <div className="tool-btn__divider" />
      {SHAPE_TOOLS.map(renderTool)}
    </div>
  );
};
