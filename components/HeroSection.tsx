import React from 'react';
import { ChevronDown } from 'lucide-react';
import { orderedOrgans } from '../data/organData';

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => (
  <section id="hero">
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
      style={{ borderColor: 'rgba(255,126,170,0.35)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 pulse-dot" />
      <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-pink-300/80">
        Interactive Human Anatomy
      </span>
    </div>

    <h1
      className="font-display font-bold leading-[0.95] tracking-tight mb-6 hero-title"
    >
      <span className="hero-gradient-text">Explore</span>
      <br />
      <span className="font-serif-display italic text-white/90">the body</span>
      <br />
      <span className="text-white/35 font-normal" style={{ fontSize: '0.65em' }}>
        from within
      </span>
    </h1>

    <p className="text-white/45 max-w-md leading-relaxed mb-6 font-light text-sm sm:text-base">
      Scroll through seven organ systems. Each one morphs in real-time 3D — tap the dock below to jump.
    </p>

    <div className="hero-pills mb-8 hidden sm:flex">
      {orderedOrgans.map((o) => (
        <span key={o.id} className="hero-pill" style={{ '--pill-color': o.accentColor } as React.CSSProperties}>
          {o.icon} {o.name}
        </span>
      ))}
    </div>

    <button
      onClick={onExplore}
      className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-medium text-white transition-all pointer-events-auto hero-cta"
    >
      Begin exploration
      <ChevronDown size={16} className="scroll-hint text-pink-300" />
    </button>
  </section>
);

export default HeroSection;
