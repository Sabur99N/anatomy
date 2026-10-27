import React from 'react';
import { ArrowRight, ChevronUp } from 'lucide-react';

interface CTASectionProps {
  onScrollTo: (id: string) => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onScrollTo }) => (
  <section id="cta" className="cta-section">
    <div className="cta-inner">
      <p className="cta-eyebrow">7 systems · 10,000 particles · real GLTF models</p>

      <h2 className="font-display cta-title">
        Ready to explore
        <br />
        <span className="font-serif-display italic cta-title-sub">human anatomy?</span>
      </h2>

      <p className="cta-desc">
        Every organ is sampled from real 3D anatomy models and rendered as an interactive particle cloud.
        Scroll back up or use the dock to revisit any system.
      </p>

      <div className="cta-actions">
        <button
          type="button"
          onClick={() => onScrollTo('brain')}
          className="cta-btn-primary group"
        >
          Explore Brain
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button
          type="button"
          onClick={() => onScrollTo('hero')}
          className="cta-btn-secondary"
        >
          <ChevronUp size={16} />
          Back to top
        </button>
      </div>
    </div>
  </section>
);

export default CTASection;
