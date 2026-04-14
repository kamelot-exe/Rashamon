/**
 * PropertiesPanel — minimal, contextual.
 * Only shown when something is selected.
 * Shows only relevant properties for the selected node.
 */

import { FC, useEffect, useState } from 'react';
import type { ShapeSceneNode, TextSceneNode, FrameSceneNode } from '@rashamon/types';
import {
  subscribe, getSelectedId, getSelectedIds, getSelectedNode,
  updateTransform, updateNodeName, updateTextContent, updateTextProperties,
  updateFill, updateStroke,
  alignSelected,
  mutateFrameWidth, mutateFrameHeight,
  updateFrameBackground,
  enableAutoLayout, disableAutoLayout, updateAutoLayout,
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

  // No selection (should not happen since parent hides panel)
  if (!selectedId || !selectedNode) return null;

  // Text
  if (selectedNode.type === 'text') {
    return <TextPanel node={selectedNode as TextSceneNode} selectedId={selectedId} />;
  }

  // Frame
  if (selectedNode.type === 'frame') {
    return <FramePanel node={selectedNode as FrameSceneNode} selectedId={selectedId} />;
  }

  // Group
  if (selectedNode.type === 'group') {
    return <GroupPanel node={selectedNode} selectedId={selectedId} />;
  }

  // Shape
  return <ShapePanel shape={selectedNode as ShapeSceneNode} selectedId={selectedId} />;
};

// ─── Shape Panel ──────────────────────────────────────

const ShapePanel: FC<{ shape: ShapeSceneNode; selectedId: string }> = ({ shape, selectedId }) => (
  <div className="panel">
    <PanelHeader type="shape" name={shape.name} />
    <PanelContent>
      <TransformSection node={shape} selectedId={selectedId} />
      <AppearanceSection shape={shape} selectedId={selectedId} />
    </PanelContent>
  </div>
);

// ─── Text Panel ───────────────────────────────────────

const TextPanel: FC<{ node: TextSceneNode; selectedId: string }> = ({ node, selectedId }) => (
  <div className="panel">
    <PanelHeader type="text" name={node.name} />
    <PanelContent>
      <Section label="Content">
        <textarea
          className="panel-input panel-input--textarea"
          value={node.content}
          onChange={(e) => updateTextContent(selectedId, e.target.value)}
          rows={3}
        />
      </Section>
      <div className="panel-row">
        <Field label="Size">
          <input className="panel-input" type="number" value={node.fontSize} min={8} onChange={(e) => updateTextProperties(selectedId, { fontSize: Number(e.target.value) })} />
        </Field>
        <Field label="Font">
          <input className="panel-input" type="text" value={node.fontFamily} onChange={(e) => updateTextProperties(selectedId, { fontFamily: e.target.value })} />
        </Field>
      </div>
      <ColorField label="Color" value={node.fill} onChange={(color) => updateTextProperties(selectedId, { fill: color })} />
    </PanelContent>
  </div>
);

// ─── Frame Panel ──────────────────────────────────────

const FramePanel: FC<{ node: FrameSceneNode; selectedId: string }> = ({ node, selectedId }) => {
  return (
    <div className="panel">
      <PanelHeader type="frame" name={node.name} />
      <PanelContent>
        <div className="panel-row">
          <Field label="X">
            <input className="panel-input" type="number" value={Math.round(node.transform.x)} onChange={(e) => updateTransform(selectedId, { ...node.transform, x: Number(e.target.value) })} />
          </Field>
          <Field label="Y">
            <input className="panel-input" type="number" value={Math.round(node.transform.y)} onChange={(e) => updateTransform(selectedId, { ...node.transform, y: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="panel-row">
          <Field label="W">
            <input className="panel-input" type="number" value={Math.round(node.width)} min={1} onChange={(e) => mutateFrameWidth(selectedId, Number(e.target.value))} />
          </Field>
          <Field label="H">
            <input className="panel-input" type="number" value={Math.round(node.height)} min={1} onChange={(e) => mutateFrameHeight(selectedId, Number(e.target.value))} />
          </Field>
        </div>
        <ColorField label="Fill" value={node.background ?? 'none'} onChange={(color) => updateFrameBackground(selectedId, color === 'none' ? null : color)} />
        <AutoLayoutSection frameId={selectedId} frame={node} />
      </PanelContent>
    </div>
  );
};

// ─── Group Panel ──────────────────────────────────────

const GroupPanel: FC<{ node: any; selectedId: string }> = ({ node, selectedId }) => (
  <div className="panel">
    <PanelHeader type="group" name={node.name} />
    <PanelContent>
      <Field label="Name">
        <input className="panel-input" type="text" value={node.name} onChange={(e) => updateNodeName(selectedId, e.target.value)} />
      </Field>
    </PanelContent>
  </div>
);

// ─── Multi-Selection Panel ────────────────────────────

const MultiSelectionPanel: FC<{ count: number }> = ({ count }) => (
  <div className="panel">
    <div className="panel__header">
      <span>{count} selected</span>
    </div>
    <PanelContent>
      <AlignDistributeSection />
    </PanelContent>
  </div>
);

// ─── Shared Sections ──────────────────────────────────

const TransformSection: FC<{ node: any; selectedId: string }> = ({ node, selectedId }) => (
  <>
    <div className="panel-row">
      <Field label="X">
        <input className="panel-input" type="number" value={Math.round(node.transform.x)} onChange={(e) => updateTransform(selectedId, { ...node.transform, x: Number(e.target.value) })} />
      </Field>
      <Field label="Y">
        <input className="panel-input" type="number" value={Math.round(node.transform.y)} onChange={(e) => updateTransform(selectedId, { ...node.transform, y: Number(e.target.value) })} />
      </Field>
    </div>
    <div className="panel-row">
      <Field label="W">
        <input className="panel-input" type="number" value={Math.round(getShapeWidth(node))} readOnly />
      </Field>
      <Field label="H">
        <input className="panel-input" type="number" value={Math.round(getShapeHeight(node))} readOnly />
      </Field>
    </div>
  </>
);

const AppearanceSection: FC<{ shape: ShapeSceneNode; selectedId: string }> = ({ shape, selectedId }) => (
  <>
    <ColorField label="Fill" value={shape.fill?.color ?? 'none'} onChange={(color) => updateFill(selectedId, color === 'none' ? null : shape.fill ? { ...shape.fill, color } : { type: 'solid', color })} />
    <StrokeField value={shape.stroke} onChange={(stroke) => updateStroke(selectedId, stroke)} />
  </>
);

const AutoLayoutSection: FC<{ frameId: string; frame: FrameSceneNode }> = ({ frameId, frame }) => {
  const config = frame.autoLayout;
  if (config.mode === 'none') {
    return (
      <div className="panel-row">
        <button className="panel-btn panel-btn--sm" onClick={() => enableAutoLayout(frameId, 'horizontal')}>↔</button>
        <button className="panel-btn panel-btn--sm" onClick={() => enableAutoLayout(frameId, 'vertical')}>↕</button>
      </div>
    );
  }

  return (
    <div className="panel-row panel-row--stacked">
      <div className="panel-row">
        <button
          className={`panel-btn panel-btn--sm ${config.mode === 'horizontal' ? 'panel-btn--active' : ''}`}
          onClick={() => config.mode === 'horizontal' ? disableAutoLayout(frameId) : enableAutoLayout(frameId, 'horizontal')}
        >↔</button>
        <button
          className={`panel-btn panel-btn--sm ${config.mode === 'vertical' ? 'panel-btn--active' : ''}`}
          onClick={() => config.mode === 'vertical' ? disableAutoLayout(frameId) : enableAutoLayout(frameId, 'vertical')}
        >↕</button>
        <Field label="Gap">
          <input className="panel-input" type="number" value={config.spacing} min={0} onChange={(e) => updateAutoLayout(frameId, { spacing: Number(e.target.value) })} style={{ width: 48 }} />
        </Field>
      </div>
      <div className="panel-row">
        <Field label="Pad L">
          <input className="panel-input" type="number" value={config.paddingLeft} min={0} onChange={(e) => updateAutoLayout(frameId, { paddingLeft: Number(e.target.value) })} style={{ width: 48 }} />
        </Field>
        <Field label="Pad R">
          <input className="panel-input" type="number" value={config.paddingRight} min={0} onChange={(e) => updateAutoLayout(frameId, { paddingRight: Number(e.target.value) })} style={{ width: 48 }} />
        </Field>
        <Field label="Pad T">
          <input className="panel-input" type="number" value={config.paddingTop} min={0} onChange={(e) => updateAutoLayout(frameId, { paddingTop: Number(e.target.value) })} style={{ width: 48 }} />
        </Field>
        <Field label="Pad B">
          <input className="panel-input" type="number" value={config.paddingBottom} min={0} onChange={(e) => updateAutoLayout(frameId, { paddingBottom: Number(e.target.value) })} style={{ width: 48 }} />
        </Field>
      </div>
    </div>
  );
};

const AlignDistributeSection: FC = () => {
  const selectedIds = getSelectedIds();
  if (selectedIds.size < 2) return null;

  return (
    <div className="panel-row panel-row--stacked">
      <div className="panel-row">
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('left')} title="Left">←</button>
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('centerH')} title="Center H">↔</button>
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('right')} title="Right">→</button>
      </div>
      <div className="panel-row">
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('top')} title="Top">↑</button>
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('middleV')} title="Middle V">↕</button>
        <button className="panel-btn panel-btn--sm" onClick={() => alignSelected('bottom')} title="Bottom">↓</button>
      </div>
    </div>
  );
};

// ─── Shared Components ────────────────────────────────

const PanelHeader: FC<{ type: string; name: string }> = ({ type, name }) => (
  <div className="panel__header">
    <span className="panel__type">{type}</span>
    <span className="panel__name">{name}</span>
  </div>
);

const PanelContent: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="panel__content">{children}</div>
);

const Section: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="panel-section">
    <span className="panel-section__label">{label}</span>
    {children}
  </div>
);

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="panel-field">
    <span className="panel-field__label">{label}</span>
    {children}
  </div>
);

const ColorField: FC<{ label: string; value: string; onChange: (color: string) => void }> = ({ label, value, onChange }) => (
  <div className="panel-row">
    <span className="panel-field__label">{label}</span>
    <input className="panel-input panel-input--color" type="color" value={value === 'none' ? '#000000' : value} onChange={(e) => onChange(e.target.value)} />
    <input className="panel-input panel-input--color-text" type="text" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const StrokeField: FC<{ value: any; onChange: (stroke: any) => void }> = ({ value, onChange }) => (
  <div className="panel-row">
    <span className="panel-field__label">Stroke</span>
    <input className="panel-input panel-input--color" type="color" value={value?.color ?? '#000000'} onChange={(e) => onChange(value ? { ...value, color: e.target.value } : { color: e.target.value, width: 1, lineCap: 'butt', lineJoin: 'miter' })} />
    <input className="panel-input" type="number" value={value?.width ?? 0} min={0} max={50} style={{ width: 48 }} onChange={(e) => { const w = Number(e.target.value); onChange(w <= 0 ? null : value ? { ...value, width: w } : { color: '#000000', width: w, lineCap: 'butt', lineJoin: 'miter' }); }} />
  </div>
);

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
