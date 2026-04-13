/**
 * PropertiesPanel — inspector for the selected node(s).
 *
 * Sections:
 * - Selection summary (type, name)
 * - Transform (X, Y, W, H, Rotation)
 * - Appearance (Fill, Stroke)
 * - Semantic Role
 * - Align & Distribute (multi-selection)
 */

import { FC, useEffect, useState } from 'react';
import type { ShapeSceneNode, TextSceneNode } from '@rashamon/types';
import {
  subscribe, getSelectedId, getSelectedIds, getSelectedNode,
  updateTransform, updateNodeName, updateTextContent, updateTextProperties,
  updateFill, updateStroke, updateSemanticRole,
  alignSelected, distributeSelected,
} from '../store/documentStore.js';
import './PropertiesPanel.css';

export const PropertiesPanel: FC = () => {
  const selectedId = getSelectedId();
  const selectedIds = getSelectedIds();
  const selectedNode = getSelectedNode();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  // Multi-selection
  if (selectedIds.size > 1) {
    return <MultiSelectionPanel count={selectedIds.size} />;
  }

  // No selection
  if (!selectedId || !selectedNode) {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">Properties</div>
        <div className="properties-panel__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No selection</p>
          <span>Select an object to edit properties</span>
        </div>
      </div>
    );
  }

  // Text node
  if (selectedNode.type === 'text') {
    return <TextPropertiesPanel node={selectedNode as TextSceneNode} selectedId={selectedId} />;
  }

  // Group node
  if (selectedNode.type === 'group') {
    return <GroupPropertiesPanel node={selectedNode} selectedId={selectedId} />;
  }

  // Shape node
  const shape = selectedNode as ShapeSceneNode;
  return <ShapePropertiesPanel shape={shape} selectedId={selectedId} />;
};

// ─── Multi Selection Panel ────────────────────────────

const MultiSelectionPanel: FC<{ count: number }> = ({ count }) => (
  <div className="properties-panel">
    <div className="properties-panel__header">
      <span>{count} objects selected</span>
    </div>
    <div className="properties-panel__content">
      <AlignDistributeSection />
    </div>
  </div>
);

// ─── Shape Properties ─────────────────────────────────

const ShapePropertiesPanel: FC<{ shape: ShapeSceneNode; selectedId: string }> = ({ shape, selectedId }) => (
  <div className="properties-panel">
    <div className="properties-panel__header">
      <SelectionSummary nodeType={shape.type} nodeName={shape.name} />
    </div>
    <div className="properties-panel__content">
      <Section title="Transform" defaultOpen>
        <TransformFields node={shape} selectedId={selectedId} />
      </Section>
      <Section title="Appearance" defaultOpen>
        <AppearanceFields shape={shape} selectedId={selectedId} />
      </Section>
      <Section title="Semantic Role">
        <RoleField selectedId={selectedId} role={shape.semanticRole} />
      </Section>
      <AlignDistributeSection />
    </div>
  </div>
);

// ─── Text Properties ──────────────────────────────────

const TextPropertiesPanel: FC<{ node: TextSceneNode; selectedId: string }> = ({ node, selectedId }) => (
  <div className="properties-panel">
    <div className="properties-panel__header">
      <SelectionSummary nodeType="text" nodeName={node.name} />
    </div>
    <div className="properties-panel__content">
      <Section title="Transform" defaultOpen>
        <div className="prop-row">
          <Field label="X">
            <input className="prop-input" type="number" value={Math.round(node.transform.x)} onChange={(e) => updateTransform(selectedId, { ...node.transform, x: Number(e.target.value) })} />
          </Field>
          <Field label="Y">
            <input className="prop-input" type="number" value={Math.round(node.transform.y)} onChange={(e) => updateTransform(selectedId, { ...node.transform, y: Number(e.target.value) })} />
          </Field>
        </div>
      </Section>
      <Section title="Content" defaultOpen>
        <textarea className="prop-input prop-input--textarea" value={node.content} onChange={(e) => updateTextContent(selectedId, e.target.value)} rows={3} />
      </Section>
      <Section title="Typography">
        <Field label="Size">
          <input className="prop-input" type="number" value={node.fontSize} min={8} onChange={(e) => updateTextProperties(selectedId, { fontSize: Number(e.target.value) })} />
        </Field>
        <Field label="Font">
          <input className="prop-input" type="text" value={node.fontFamily} onChange={(e) => updateTextProperties(selectedId, { fontFamily: e.target.value })} />
        </Field>
      </Section>
      <Section title="Appearance">
        <ColorField label="Color" value={node.fill} onChange={(color) => updateTextProperties(selectedId, { fill: color })} />
      </Section>
    </div>
  </div>
);

// ─── Group Properties ─────────────────────────────────

const GroupPropertiesPanel: FC<{ node: any; selectedId: string }> = ({ node, selectedId }) => (
  <div className="properties-panel">
    <div className="properties-panel__header">
      <SelectionSummary nodeType="group" nodeName={node.name} />
    </div>
    <div className="properties-panel__content">
      <Section title="Name" defaultOpen>
        <Field label="Name">
          <input className="prop-input" type="text" value={node.name} onChange={(e) => updateNodeName(selectedId, e.target.value)} />
        </Field>
      </Section>
      <p className="properties-panel__hint">Use Layers panel to manage children</p>
    </div>
  </div>
);

// ─── Section / Field Components ───────────────────────

const Section: FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="prop-section">
      <button className="prop-section__title" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <svg
          className={`prop-section__chevron ${open ? 'prop-section__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span>{title}</span>
      </button>
      {open && <div className="prop-section__content">{children}</div>}
    </div>
  );
};

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="prop-field">
    <span className="prop-field__label">{label}</span>
    {children}
  </div>
);

// ─── Selection Summary ────────────────────────────────

const SelectionSummary: FC<{ nodeType: string; nodeName: string }> = ({ nodeType, nodeName }) => (
  <div className="selection-summary">
    <span className="selection-summary__type">{nodeType}</span>
    <span className="selection-summary__name">{nodeName}</span>
  </div>
);

// ─── Transform Fields ─────────────────────────────────

const TransformFields: FC<{ node: any; selectedId: string }> = ({ node, selectedId }) => (
  <>
    <div className="prop-row">
      <Field label="X">
        <input className="prop-input" type="number" value={Math.round(node.transform.x)} onChange={(e) => updateTransform(selectedId, { ...node.transform, x: Number(e.target.value) })} />
      </Field>
      <Field label="Y">
        <input className="prop-input" type="number" value={Math.round(node.transform.y)} onChange={(e) => updateTransform(selectedId, { ...node.transform, y: Number(e.target.value) })} />
      </Field>
    </div>
    <div className="prop-row">
      <Field label="W">
        <input className="prop-input" type="number" value={Math.round(getShapeWidth(node))} onChange={(e) => updateShapeDimension(node, selectedId, 'width', Number(e.target.value))} />
      </Field>
      <Field label="H">
        <input className="prop-input" type="number" value={Math.round(getShapeHeight(node))} onChange={(e) => updateShapeDimension(node, selectedId, 'height', Number(e.target.value))} />
      </Field>
    </div>
    <Field label="Rotation">
      <input className="prop-input" type="number" value={Math.round(node.transform.rotation)} onChange={(e) => updateTransform(selectedId, { ...node.transform, rotation: Number(e.target.value) })} />
    </Field>
  </>
);

// ─── Appearance Fields ────────────────────────────────

const AppearanceFields: FC<{ shape: ShapeSceneNode; selectedId: string }> = ({ shape, selectedId }) => (
  <>
    <ColorField
      label="Fill"
      value={shape.fill?.color ?? 'none'}
      onChange={(color) => updateFill(selectedId, color === 'none' ? null : shape.fill ? { ...shape.fill, color } : { type: 'solid', color })}
    />
    <StrokeField
      value={shape.stroke}
      onChange={(stroke) => updateStroke(selectedId, stroke)}
    />
  </>
);

const ColorField: FC<{ label: string; value: string; onChange: (color: string) => void }> = ({ label, value, onChange }) => (
  <div className="prop-row prop-row--color">
    <span className="prop-label">{label}</span>
    <input
      className="prop-input prop-input--color"
      type="color"
      value={value === 'none' ? '#000000' : value}
      onChange={(e) => onChange(e.target.value)}
    />
    <input
      className="prop-input prop-input--color-text"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const StrokeField: FC<{ value: any; onChange: (stroke: any) => void }> = ({ value, onChange }) => (
  <div className="prop-row prop-row--color">
    <span className="prop-label">Stroke</span>
    <input
      className="prop-input prop-input--color"
      type="color"
      value={value?.color ?? '#000000'}
      onChange={(e) => onChange(value ? { ...value, color: e.target.value } : { color: e.target.value, width: 1, lineCap: 'butt', lineJoin: 'miter' })}
    />
    <input
      className="prop-input"
      type="number"
      value={value?.width ?? 0}
      min={0}
      max={50}
      style={{ width: '52px' }}
      onChange={(e) => {
        const w = Number(e.target.value);
        onChange(w <= 0 ? null : value ? { ...value, width: w } : { color: '#000000', width: w, lineCap: 'butt', lineJoin: 'miter' });
      }}
    />
    <span className="prop-unit">px</span>
  </div>
);

// ─── Role Field ───────────────────────────────────────

const RoleField: FC<{ selectedId: string; role: string | object | undefined }> = ({ selectedId, role }) => {
  const roleStr = typeof role === 'string' ? role : 'none';
  return (
    <div className="prop-field">
      <select
        className="prop-input prop-input--select"
        value={roleStr}
        onChange={(e) => updateSemanticRole(selectedId, e.target.value === 'none' ? undefined : e.target.value as import('@rashamon/types').SemanticRole)}
      >
        <option value="none">None</option>
        <option value="background">Background</option>
        <option value="foreground">Foreground</option>
        <option value="annotation">Annotation</option>
        <option value="guide">Guide</option>
      </select>
      {roleStr !== 'none' && (
        <span className="role-badge">{roleStr}</span>
      )}
    </div>
  );
};

// ─── Align & Distribute ───────────────────────────────

const AlignDistributeSection: FC = () => {
  const selectedIds = getSelectedIds();
  if (selectedIds.size < 2) return null;

  return (
    <Section title="Align & Distribute">
      <div className="align-grid">
        <button className="align-btn" onClick={() => alignSelected('left')} title="Align Left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M17 10H3M21 6H3M21 14H3M17 18H3" strokeLinecap="round" /></svg>
        </button>
        <button className="align-btn" onClick={() => alignSelected('centerH')} title="Center H">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v18M16 7H8M16 11H8M16 13H8M16 17H8" strokeLinecap="round" /></svg>
        </button>
        <button className="align-btn" onClick={() => alignSelected('right')} title="Align Right">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 10h14M3 6h18M3 14h18M7 18h14" strokeLinecap="round" /></svg>
        </button>
        <button className="align-btn" onClick={() => alignSelected('top')} title="Align Top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 17V3M6 21V3M14 21V3M18 17V3" strokeLinecap="round" /></svg>
        </button>
        <button className="align-btn" onClick={() => alignSelected('middleV')} title="Middle V">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12h18M7 16V8M11 16V8M13 16V8M17 16V8" strokeLinecap="round" /></svg>
        </button>
        <button className="align-btn" onClick={() => alignSelected('bottom')} title="Align Bottom">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 7v14M6 3v18M14 3v18M18 7v14" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="prop-row" style={{ marginTop: 6 }}>
        <button className="align-btn align-btn--wide" onClick={() => distributeSelected('horizontal')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12h18M8 6v12M16 6v12" strokeLinecap="round" /></svg>
          Distribute H
        </button>
        <button className="align-btn align-btn--wide" onClick={() => distributeSelected('vertical')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v18M6 8h12M6 16h12" strokeLinecap="round" /></svg>
          Distribute V
        </button>
      </div>
    </Section>
  );
};

// ─── Helpers ──────────────────────────────────────────

function getShapeWidth(shape: any): number {
  const g = shape.geometry;
  if (g.type === 'rect') return g.width;
  if (g.type === 'ellipse') return g.rx * 2;
  if (g.type === 'line') return Math.abs(g.x2 - g.x1);
  return 0;
}

function getShapeHeight(shape: any): number {
  const g = shape.geometry;
  if (g.type === 'rect') return g.height;
  if (g.type === 'ellipse') return g.ry * 2;
  if (g.type === 'line') return Math.abs(g.y2 - g.y1);
  return 0;
}

function updateShapeDimension(shape: any, selectedId: string, dim: 'width' | 'height', value: number) {
  const g = shape.geometry;
  if (g.type === 'rect') {
    if (dim === 'width') g.width = value;
    else g.height = value;
    updateTransform(selectedId, { ...shape.transform });
  }
}
