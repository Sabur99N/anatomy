import React from 'react';
import { OrganData } from '../types';

interface ScrollNavProps {
  sections: { id: string; label: string }[];
  activeId: string;
  onNavigate: (id: string) => void;
}

const ScrollNav: React.FC<ScrollNavProps> = ({ sections, activeId, onNavigate }) => (
  <nav className="scroll-nav" aria-label="Section navigation">
    {sections.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        onClick={() => onNavigate(id)}
        className="scroll-nav-item"
        aria-label={`Go to ${label}`}
        aria-current={activeId === id ? 'true' : undefined}
      >
        <span
          className={`scroll-nav-label ${activeId === id ? 'active' : 'inactive'}`}
        >
          {label}
        </span>
        <div className={`nav-dot ${activeId === id ? 'active' : ''}`} />
      </button>
    ))}
  </nav>
);

export default ScrollNav;

export function buildNavSections(organs: OrganData[]) {
  return [
    { id: 'hero', label: 'Home' },
    ...organs.map((o) => ({ id: o.id, label: o.name })),
    { id: 'cta', label: 'Start' },
  ];
}
