import { FC } from 'react';
import './styles.css';

export const TopBar: FC = () => {
  return (
    <header className="topbar" role="toolbar" aria-label="Main toolbar">
      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden="true">◆</span>
        <span className="topbar__title">Rashamon Draw</span>
        <span className="topbar__version">v0.0.0</span>
      </div>
      <div className="topbar__spacer" />
      <div className="topbar__actions">
        <button className="topbar__btn" title="File" aria-label="File menu">
          File
        </button>
        <button className="topbar__btn" title="Edit" aria-label="Edit menu">
          Edit
        </button>
        <button className="topbar__btn" title="View" aria-label="View menu">
          View
        </button>
      </div>
    </header>
  );
};
