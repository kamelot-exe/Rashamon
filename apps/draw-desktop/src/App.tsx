/**
 * Main application shell for Rashamon Draw.
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │                TopBar                        │
 * ├──────────┬───────────────────────┬───────────┤
 * │ Sidebar  │      Canvas           │ Inspector │
 * │ (tools + │   (SVG renderer       │ (props)   │
 * │ layers)  │    + tool interaction)│           │
 * ├──────────┴───────────────────────┴───────────┤
 * │               StatusBar                      │
 * └──────────────────────────────────────────────┘
 */

import { useEffect, useState, FC } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ToolButtons } from './tools/ToolButtons.js';
import { LayersPanel } from './panels/LayersPanel.js';
import { PropertiesPanel } from './panels/PropertiesPanel.js';
import { CanvasView } from './canvas/CanvasView.js';
import { getDocument, subscribe, canUndo, canRedo, undo, redo } from './store/documentStore.js';
import { handleNewDocument, handleSaveDocument, handleOpenDocument } from './utils/fileOps.js';
import './styles/global.css';

// ─── TopBar ─────────────────────────────────────────────────

const TopBar: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  return (
    <header className="topbar" role="toolbar" aria-label="Main toolbar">
      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden="true">◆</span>
        <span className="topbar__title">Rashamon Draw</span>
        <span className="topbar__version">v0.0.0-alpha</span>
      </div>
      <div className="topbar__file">
        <button className="topbar__btn" onClick={handleNewDocument} title="New (Ctrl+N)">
          New
        </button>
        <button className="topbar__btn" onClick={handleOpenDocument} title="Open (Ctrl+O)">
          Open
        </button>
        <button className="topbar__btn" onClick={handleSaveDocument} title="Save (Ctrl+S)">
          Save
        </button>
      </div>
      <div className="topbar__edit">
        <button
          className="topbar__btn"
          onClick={() => undo()}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          className="topbar__btn"
          onClick={() => redo()}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          Redo
        </button>
      </div>
      <div className="topbar__spacer" />
      <div className="topbar__doc-title">
        {doc.metadata.title || 'Untitled'}
      </div>
    </header>
  );
};

// ─── StatusBar ──────────────────────────────────────────────

const StatusBar: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  const objectCount = doc.root.children.length;

  return (
    <footer className="statusbar" role="status" aria-label="Status bar">
      <div className="statusbar__left">
        <span className="statusbar__item">Ready</span>
        <span className="statusbar__separator">|</span>
        <span className="statusbar__item">{objectCount} object{objectCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="statusbar__right">
        <span className="statusbar__item">{doc.canvas.width} × {doc.canvas.height}</span>
        <span className="statusbar__separator">|</span>
        <span className="statusbar__item">Zoom: 100%</span>
      </div>
    </footer>
  );
};

// ─── App ────────────────────────────────────────────────────

export function App() {
  const [coreInfo, setCoreInfo] = useState<string>('dev mode');

  useEffect(() => {
    invoke<string>('get_core_info')
      .then((info) => {
        try {
          const parsed = JSON.parse(info);
          setCoreInfo(`${parsed.name} v${parsed.version}`);
        } catch {
          setCoreInfo(info);
        }
      })
      .catch(() => {
        // Tauri commands may not be available in all dev scenarios
        setCoreInfo('dev mode');
      });
  }, []);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        {/* Left sidebar: tools + layers */}
        <aside className="app-sidebar">
          <ToolButtons />
          <div className="app-sidebar__divider" />
          <LayersPanel />
        </aside>

        {/* Center: canvas */}
        <main className="app-canvas">
          <CanvasView />
        </main>

        {/* Right: properties inspector */}
        <aside className="app-inspector">
          <PropertiesPanel />
        </aside>
      </div>
      <StatusBar />
      {/* Debug info (dev only) */}
      <div className="app-debug">
        <code>Core: {coreInfo}</code>
      </div>
    </div>
  );
}
