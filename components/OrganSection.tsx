import React from 'react';
import { ArrowRight } from 'lucide-react';
import { OrganData } from '../types';

interface OrganSectionProps {
  organ: OrganData;
  index: number;
  isActive: boolean;
}

const OrganSection: React.FC<OrganSectionProps> = ({ organ, index, isActive }) => {
  const alignRight = index % 2 === 1;

  return (
    <section
      id={organ.id}
      className={`organ-section relative ${alignRight ? 'align-right' : 'align-left'}`}
    >
      <div
        className="section-glow transition-opacity duration-500"
        style={{
          ['--glow-color' as string]: organ.glowColor,
          ['--glow-x' as string]: alignRight ? '28%' : '72%',
          opacity: isActive ? 1 : 0.25,
        }}
      />

      <div className="organ-section-inner">
        <div
          className="organ-badge"
          style={{ background: `${organ.accentColor}20`, border: `1px solid ${organ.accentColor}50` }}
        >
          <span className="organ-badge-dot pulse-dot" style={{ background: organ.accentColor }} />
          <span style={{ color: organ.accentColor }}>{organ.category}</span>
        </div>

        <h2
          className="font-display organ-name"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${organ.accentColor} 85%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {organ.name}
        </h2>

        <p className="font-serif-display organ-tagline" style={{ color: `${organ.accentColor}cc` }}>
          {organ.tagline}
        </p>

        <p className="organ-desc">{organ.description}</p>

        <div className="organ-stat-row">
          <div className="glass-card organ-stat" style={{ borderColor: `${organ.accentColor}35` }}>
            <span className="stat-label">{organ.stat.label}</span>
            <span className="font-display stat-value" style={{ color: organ.accentColor }}>
              {organ.stat.value}
            </span>
          </div>
          <div className="glass-card organ-stat organ-stat-secondary">
            <span className="stat-label">System</span>
            <span className="font-display stat-value-secondary" style={{ color: organ.accentColor }}>
              {organ.category.split(' ')[0]}
            </span>
          </div>
        </div>

        <div className="organ-cards">
          {organ.facts.slice(0, 2).map((f, i) => (
            <div key={`f-${i}`} className="glass-card organ-card" style={{ borderColor: `${organ.accentColor}22` }}>
              <span className="card-label" style={{ color: `${organ.accentColor}aa` }}>
                {i === 0 ? 'Key Fact' : 'Did You Know'}
              </span>
              <p>{f}</p>
            </div>
          ))}
          {organ.parts.slice(0, 1).map((part, i) => (
            <div key={`p-${i}`} className="glass-card organ-card" style={{ borderColor: `${organ.accentColor}18` }}>
              <div className="card-header">
                <span style={{ color: organ.accentColor }}>{part.name}</span>
                <ArrowRight size={13} style={{ color: `${organ.accentColor}66` }} />
              </div>
              <p className="card-desc">{part.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrganSection;
