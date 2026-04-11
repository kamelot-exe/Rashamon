import { FC } from 'react';
import './styles.css';

export const StatusBar: FC = () => {
  return (
    <footer className="statusbar" role="status" aria-label="Status bar">
      <div className="statusbar__left">
        <span className="statusbar__item">Ready</span>
      </div>
      <div className="statusbar__right">
        <span className="statusbar__item">Zoom: 100%</span>
        <span className="statusbar__item">1920 × 1080</span>
      </div>
    </footer>
  );
};
