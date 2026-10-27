import React from 'react';

const LandingHeader: React.FC = () => (
  <header className="site-header">
    <div className="site-header-inner">
      <div className="site-logo">
        <div className="site-logo-mark glass flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-white/60 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-white/40" />
            </div>
          </div>
        </div>
        <span className="font-display site-logo-text">
          anatomy<span className="text-white/40">.</span>
        </span>
      </div>

      <nav className="site-nav" aria-label="Main">
        {['Systems', 'Explore', 'Science', 'About'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>
            {item}
          </a>
        ))}
      </nav>

      <button type="button" className="site-header-btn glass-light">
        Get Started
      </button>
    </div>
  </header>
);

export default LandingHeader;
