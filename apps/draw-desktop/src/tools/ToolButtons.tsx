/**
 * ToolButtons — tool selector for the left sidebar.
 */

import { FC, useEffect, useState } from 'react';
import { getActiveTool, setActiveTool, ToolType, subscribeTool } from '../tools/toolSystem.js';
import './ToolButtons.css';

interface ToolButtonDef {
  type: ToolType;
  label: string;
  shortcut: string;
  icon: string;
}

const TOOLS: ToolButtonDef[] = [
  { type: 'select', label: 'Select', shortcut: 'V', icon: '◇' },
  { type: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: '▭' },
  { type: 'ellipse', label: 'Ellipse', shortcut: 'E', icon: '○' },
  { type: 'line', label: 'Line', shortcut: 'L', icon: '╱' },
];

export const ToolButtons: FC = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeTool(() => forceUpdate((n) => n + 1));
  }, []);

  const active = getActiveTool();

  return (
    <div className="tool-buttons" role="toolbar" aria-label="Drawing tools">
      {TOOLS.map((tool) => (
        <button
          key={tool.type}
          className={`tool-btn ${active === tool.type ? 'tool-btn--active' : ''}`}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
          aria-pressed={active === tool.type}
          onClick={() => setActiveTool(tool.type)}
        >
          <span className="tool-btn__icon" aria-hidden="true">
            {tool.icon}
          </span>
          <span className="tool-btn__label">{tool.label}</span>
          <span className="tool-btn__shortcut">{tool.shortcut}</span>
        </button>
      ))}
    </div>
  );
};
