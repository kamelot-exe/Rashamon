import { FC } from 'react';
import './styles.css';

export interface SidebarProps {
  width?: number;
}

export const Sidebar: FC<SidebarProps> = () => {
  return (
    <aside className="sidebar" aria-label="Tools sidebar">
      <div className="sidebar__header">Tools</div>
      <div className="sidebar__content">
        <div className="sidebar__placeholder">
          <p>Tools panel</p>
          <span className="sidebar__hint">Select, shapes, pen, etc.</span>
        </div>
      </div>
    </aside>
  );
};
