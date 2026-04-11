import { FC } from 'react';
import './styles.css';

export interface InspectorProps {
  width?: number;
}

export const Inspector: FC<InspectorProps> = () => {
  return (
    <aside className="inspector" aria-label="Properties inspector">
      <div className="inspector__header">Properties</div>
      <div className="inspector__content">
        <div className="inspector__placeholder">
          <p>Properties panel</p>
          <span className="inspector__hint">
            Transform, fill, stroke, opacity, etc.
          </span>
        </div>
      </div>
    </aside>
  );
};
