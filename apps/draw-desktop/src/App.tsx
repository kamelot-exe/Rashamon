/**
 * Main application shell for Rashamon Canvas.
 *
 * Professional editor layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  TopBar (brand · file · edit · export · zoom · doc title)   │
 * ├────┬──────────────────────────┬──────────────────────────────┤
 * │ 🔧 │                          │  Properties / Inspector      │
 * │    │      Canvas              │                              │
 * │    │                          │                              │
 * │    │                          │                              │
 * └────┴──────────────────────────┴──────────────────────────────┘
 * │  StatusBar (selection · tool · scope · zoom · canvas size)   │
 * └─────────────────────────────────────────────────────────────┘
 */

import { useEffect, useState, FC } from 'react';
import { ToolButtons } from './tools/ToolButtons.js';
import { LayersPanel } from './panels/LayersPanel.js';
import { HistoryPanel } from './panels/HistoryPanel.js';
import { PropertiesPanel } from './panels/PropertiesPanel.js';
import { CanvasView } from './canvas/CanvasView.js';
import {
  getDocument, subscribe, canUndo, canRedo, undo, redo,
  getEditScopeGroup, getSelectedIds,
  addFrameNode,
} from './store/documentStore.js';
import { handleNewDocument, handleSaveDocument, handleOpenDocument, handleExportSvg, handleExportPng } from './utils/fileOps.js';
import { resetTransform, getCanvasTransform, subscribe as subscribeTransform } from './store/canvasTransformStore.js';
import { getActiveTool, subscribeTool } from './tools/toolSystem.js';
import './styles/global.css';

// ─── TopBar ─────────────────────────────────────────────

const FRAME_PRESETS = [
  { label: 'Desktop', w: 1440, h: 900 },
  { label: 'Tablet', w: 768, h: 1024 },
  { label: 'Mobile', w: 390, h: 844 },
  { label: 'Custom', w: 800, h: 600 },
];

const TopBar: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const unsubDoc = subscribe(() => forceUpdate((n) => n + 1));
    const unsubTransform = subscribeTransform(() => {
      setZoom(getCanvasTransform().zoom);
      forceUpdate((n) => n + 1);
    });
    return () => { unsubDoc(); unsubTransform(); };
  }, []);

  const handleFramePreset = (preset: typeof FRAME_PRESETS[number]) => {
    const ct = getCanvasTransform();
    // Place frame near center of current view
    const x = (doc.canvas.width / 2 - preset.w / 2) - (ct.panX / ct.zoom);
    const y = (doc.canvas.height / 2 - preset.h / 2) - (ct.panY / ct.zoom);
    addFrameNode(preset.w, preset.h, preset.label, '#FFFFFF', { x, y });
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <header className="topbar" role="toolbar" aria-label="Main toolbar">
      {/* Brand */}
      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden="true">◆</span>
        <span className="topbar__title">Rashamon Canvas</span>
      </div>

      {/* File actions */}
      <div className="topbar__group">
        <button className="topbar__btn" onClick={handleNewDocument} title="New (Ctrl+N)">New</button>
        <button className="topbar__btn" onClick={handleOpenDocument} title="Open (Ctrl+O)">Open</button>
        <button className="topbar__btn" onClick={handleSaveDocument} title="Save (Ctrl+S)">Save</button>
      </div>

      <div className="topbar__separator" />

      {/* Edit */}
      <div className="topbar__group">
        <button className="topbar__btn" onClick={() => undo()} disabled={!canUndo()} title="Undo (Ctrl+Z)">Undo</button>
        <button className="topbar__btn" onClick={() => redo()} disabled={!canRedo()} title="Redo (Ctrl+Y)">Redo</button>
      </div>

      <div className="topbar__separator" />

      {/* Export */}
      <div className="topbar__group">
        <button className="topbar__btn" onClick={handleExportSvg} title="Export SVG">SVG</button>
        <button className="topbar__btn" onClick={handleExportPng} title="Export PNG">PNG</button>
      </div>

      <div className="topbar__separator" />

      {/* Frame presets */}
      <div className="topbar__group">
        <select
          className="topbar__select"
          title="Add frame preset"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              const preset = FRAME_PRESETS.find((p) => p.label === e.target.value);
              if (preset) handleFramePreset(preset);
              e.target.value = '';
            }
          }}
        >
          <option value="" disabled>Frame</option>
          {FRAME_PRESETS.map((p) => (
            <option key={p.label} value={p.label}>{p.label} ({p.w}×{p.h})</option>
          ))}
        </select>
      </div>

      <div className="topbar__separator" />

      {/* View */}
      <button className="topbar__btn" onClick={() => resetTransform()} title="Reset view (Ctrl+0)">Reset View</button>

      {/* Spacer */}
      <div className="topbar__spacer" />

      {/* Zoom display */}
      <div className="topbar__zoom" title="Zoom level">
        {zoomPercent}%
      </div>

      {/* Document title */}
      <div className="topbar__doc-title">{doc.metadata.title || 'Untitled'}</div>
    </header>
  );
};

// ─── StatusBar ──────────────────────────────────────────

const StatusBar: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveToolState] = useState('select');
  const [selectionCount, setSelectionCount] = useState(0);
  const [scopeGroup, setScopeGroup] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const unsubDoc = subscribe(() => {
      setSelectionCount(getSelectedIds().size);
      setScopeGroup(getEditScopeGroup());
      forceUpdate((n) => n + 1);
    });
    const unsubTransform = subscribeTransform(() => setZoom(getCanvasTransform().zoom));
    const unsubTool = subscribeTool(() => setActiveToolState(getActiveTool()));
    return () => { unsubDoc(); unsubTransform(); unsubTool(); };
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="statusbar" role="status" aria-label="Status bar">
      <div className="statusbar__left">
        <span className="statusbar__item">{selectionCount} selected</span>
        <span className="statusbar__separator" />
        <span className="statusbar__item">{activeTool}</span>
        {scopeGroup && (
          <>
            <span className="statusbar__separator" />
            <span className="statusbar__item statusbar__item--scope">{scopeGroup.name}</span>
          </>
        )}
      </div>
      <div className="statusbar__right">
        <span className="statusbar__item statusbar__item--zoom">{zoomPercent}%</span>
        <span className="statusbar__separator" />
        <span className="statusbar__item">{doc.canvas.width} × {doc.canvas.height}</span>
      </div>
    </footer>
  );
};

// ─── App ────────────────────────────────────────────────

export function App() {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        {/* Left: tool rail + secondary panel (layers + history) */}
        <aside className="app-sidebar">
          <div className="app-sidebar__tools">
            <ToolButtons />
          </div>
          <div className="app-sidebar__secondary">
            <LayersPanel />
            <HistoryPanel />
          </div>
        </aside>

        {/* Center: canvas */}
        <main className="app-canvas">
          <CanvasView />
        </main>

        {/* Right: inspector */}
        <aside className="app-inspector">
          <PropertiesPanel />
        </aside>
      </div>
      <StatusBar />
    </div>
  );
}
