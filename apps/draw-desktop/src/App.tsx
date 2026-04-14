/**
 * Main application shell for Rashamon Canvas.
 *
 * Minimal Figma-like layout:
 * ┌────────────────────────────────────────────────────┐
 * │ ◆ File  Edit  View  Export          Zoom    Title  │
 * ├────┬──────────────────────────┬────────────────────┤
 * │ ▤  │                          │ (Properties)       │
 * │    │      Canvas              │                    │
 * │    │                          │                    │
 * └────┴──────────────────────────┴────────────────────┘
 */

import { useEffect, useState, FC } from 'react';
import { ToolButtons } from './tools/ToolButtons.js';
import { LayersPanel } from './panels/LayersPanel.js';
import { PropertiesPanel } from './panels/PropertiesPanel.js';
import { CanvasView } from './canvas/CanvasView.js';
import {
  getDocument, subscribe, canUndo, canRedo, undo, redo,
  getEditScopeGroup, getSelectedIds, getSelectedId,
} from './store/documentStore.js';
import { handleNewDocument, handleSaveDocument, handleOpenDocument, handleExportSvg, handleExportPng } from './utils/fileOps.js';
import { resetTransform, getCanvasTransform, subscribe as subscribeTransform, updateZoomAroundPoint, setPan } from './store/canvasTransformStore.js';
import './styles/global.css';

// ─── TopBar ─────────────────────────────────────────────

const TopBar: FC = () => {
  const doc = getDocument();
  const [, forceUpdate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const unsubDoc = subscribe(() => forceUpdate((n) => n + 1));
    const unsubTransform = subscribeTransform(() => {
      setZoom(getCanvasTransform().zoom);
      forceUpdate((n) => n + 1);
    });
    return () => { unsubDoc(); unsubTransform(); };
  }, []);

  const zoomIn = () => {
    const ct = getCanvasTransform();
    updateZoomAroundPoint(window.innerWidth / 2, window.innerHeight / 2, ct.zoom * 1.25);
  };

  const zoomOut = () => {
    const ct = getCanvasTransform();
    updateZoomAroundPoint(window.innerWidth / 2, window.innerHeight / 2, ct.zoom / 1.25);
  };

  const zoomTo100 = () => {
    const ct = getCanvasTransform();
    const factor = 1 / ct.zoom;
    updateZoomAroundPoint(window.innerWidth / 2, window.innerHeight / 2, 1);
    setPan(-ct.panX * (factor - 1) + ct.panX, -ct.panY * (factor - 1) + ct.panY);
  };

  const zoomPercent = Math.round(zoom * 100);

  // Close menus on click outside
  useEffect(() => {
    const handler = () => setMenuOpen(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden="true">◆</span>
      </div>

      {/* File menu */}
      <div className="topbar__menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === 'file' ? null : 'file'); }}>
        <span className="topbar__menu-label">File</span>
        {menuOpen === 'file' && (
          <div className="topbar__dropdown">
            <button className="topbar__dropdown-item" onClick={handleNewDocument}>New</button>
            <button className="topbar__dropdown-item" onClick={handleOpenDocument}>Open…</button>
            <button className="topbar__dropdown-item" onClick={handleSaveDocument}>Save…</button>
          </div>
        )}
      </div>

      {/* Edit menu */}
      <div className="topbar__menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === 'edit' ? null : 'edit'); }}>
        <span className="topbar__menu-label">Edit</span>
        {menuOpen === 'edit' && (
          <div className="topbar__dropdown">
            <button className="topbar__dropdown-item" onClick={() => undo()} disabled={!canUndo()}>Undo</button>
            <button className="topbar__dropdown-item" onClick={() => redo()} disabled={!canRedo()}>Redo</button>
          </div>
        )}
      </div>

      {/* View menu */}
      <div className="topbar__menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === 'view' ? null : 'view'); }}>
        <span className="topbar__menu-label">View</span>
        {menuOpen === 'view' && (
          <div className="topbar__dropdown">
            <button className="topbar__dropdown-item" onClick={() => resetTransform()}>Reset View</button>
            <button className="topbar__dropdown-item" onClick={zoomTo100}>100%</button>
          </div>
        )}
      </div>

      {/* Export menu */}
      <div className="topbar__menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === 'export' ? null : 'export'); }}>
        <span className="topbar__menu-label">Export</span>
        {menuOpen === 'export' && (
          <div className="topbar__dropdown">
            <button className="topbar__dropdown-item" onClick={handleExportSvg}>Export as SVG</button>
            <button className="topbar__dropdown-item" onClick={handleExportPng}>Export as PNG</button>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="topbar__spacer" />

      {/* Zoom */}
      <div className="topbar__zoom-controls">
        <button className="topbar__zoom-btn" onClick={zoomOut} title="Zoom out">−</button>
        <span className="topbar__zoom-value">{zoomPercent}%</span>
        <button className="topbar__zoom-btn" onClick={zoomIn} title="Zoom in">+</button>
      </div>

      {/* Doc title */}
      <div className="topbar__doc-title">{doc.metadata.title || 'Untitled'}</div>
    </header>
  );
};

// ─── StatusBar ──────────────────────────────────────────

const StatusBar: FC = () => {
  const [, forceUpdate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectionCount, setSelectionCount] = useState(0);
  const [scopeGroup, setScopeGroup] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const unsubDoc = subscribe(() => {
      setSelectionCount(getSelectedIds().size);
      setScopeGroup(getEditScopeGroup());
      forceUpdate((n) => n + 1);
    });
    const unsubTransform = subscribeTransform(() => setZoom(getCanvasTransform().zoom));
    return () => { unsubDoc(); unsubTransform(); };
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="statusbar">
      {selectionCount > 0 && (
        <span className="statusbar__item">{selectionCount} selected</span>
      )}
      {scopeGroup && (
        <span className="statusbar__item statusbar__item--scope">{scopeGroup.name}</span>
      )}
      <span className="statusbar__spacer" />
      <span className="statusbar__item statusbar__item--zoom">{zoomPercent}%</span>
    </footer>
  );
};

// ─── App ────────────────────────────────────────────────

export function App() {
  const hasSelection = getSelectedId() !== null;

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        {/* Left: tool rail */}
        <aside className="app-sidebar">
          <ToolButtons />
        </aside>

        {/* Left panel: layers */}
        <aside className="app-left-panel">
          <LayersPanel />
        </aside>

        {/* Center: canvas */}
        <main className="app-canvas">
          <CanvasView />
        </main>

        {/* Right: inspector — only shown when something is selected */}
        {hasSelection && (
          <aside className="app-inspector">
            <PropertiesPanel />
          </aside>
        )}
      </div>
      <StatusBar />
    </div>
  );
}
