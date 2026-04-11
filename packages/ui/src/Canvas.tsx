import { FC } from 'react';
import './styles.css';

export interface CanvasProps {
  children?: React.ReactNode;
}

export const Canvas: FC<CanvasProps> = () => {
  return (
    <div className="canvas-area" role="main" aria-label="Canvas">
      <div className="canvas-workspace">
        <div className="canvas-placeholder">
          <div className="canvas-placeholder__icon" aria-hidden="true">◇</div>
          <p className="canvas-placeholder__text">Canvas</p>
          <span className="canvas-placeholder__hint">
            Your design workspace will appear here
          </span>
        </div>
      </div>
    </div>
  );
};
