import { Bell, Search, RefreshCw } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="live-indicator">
          <span className="live-dot" />
          LIVE
        </div>
        <button className="topbar-btn">
          <Search size={14} />
        </button>
        <button className="topbar-btn">
          <RefreshCw size={14} />
        </button>
        <button className="topbar-btn">
          <Bell size={14} />
          <span className="dot" />
        </button>
      </div>
    </header>
  );
}
