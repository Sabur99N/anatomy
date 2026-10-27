import React from 'react';
import { orderedOrgans } from '../data/organData';

interface OrganDockProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const OrganDock: React.FC<OrganDockProps> = ({ activeId, onSelect }) => (
  <div className="organ-dock">
    {orderedOrgans.map((o) => (
      <button
        key={o.id}
        type="button"
        className={`organ-dock-btn ${activeId === o.id ? 'active' : ''}`}
        style={{ '--accent': o.accentColor } as React.CSSProperties}
        onClick={() => onSelect(o.id)}
      >
        <span>{o.icon}</span>
        <span className="hidden sm:inline">{o.name}</span>
      </button>
    ))}
  </div>
);

export default OrganDock;
