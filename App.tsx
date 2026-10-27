
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { orderedOrgans, organData } from './data/organData';
import { AnatomyScene } from './core/Scene';
import { fetchOrganPoints, fetchOrganPointsSync, preloadOrgans } from './core/organPointCache';
import { OrganData } from './types';
import LandingHeader from './components/LandingHeader';
import HeroSection from './components/HeroSection';
import OrganSection from './components/OrganSection';
import OrganDock from './components/OrganDock';
import ScrollNav, { buildNavSections } from './components/ScrollNav';
import CTASection from './components/CTASection';
import { useSmoothScroll } from './hooks/useSmoothScroll';

const SECTIONS = ['hero', ...orderedOrgans.map((o) => o.id), 'cta'];

function sectionToOrgan(id: string): OrganData {
  if (id === 'hero') return organData.brain;
  return organData[id];
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AnatomyScene | null>(null);
  const showingRef = useRef('');
  const reqRef = useRef(0);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  const [activeSection, setActiveSection] = useState('hero');
  const [activeOrgan, setActiveOrgan] = useState('brain');
  const { scrollTo } = useSmoothScroll();

  const showOrgan = useCallback(async (organ: OrganData) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const req = ++reqRef.current;
    const points = await fetchOrganPoints(organ);
    if (req !== reqRef.current || !sceneRef.current || !points.length) return;

    showingRef.current = organ.id;
    setActiveOrgan(organ.id);
    scene.morphTo(points, organ.colors);

    const anim = organ.animations[0];
    if (anim === 'heartbeat' || anim === 'breathe') {
      setTimeout(() => sceneRef.current?.playAnimation(anim), 2200);
    }
  }, []);

  const pickBestSection = useCallback(() => {
    let bestId = '';
    let bestRatio = 0;
    ratiosRef.current.forEach((ratio, id) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    });
    if (!bestId || bestRatio < 0.15) return;
    if (bestId === 'cta') return;

    setActiveSection(bestId);
    const organ = sectionToOrgan(bestId);
    if (organ.id !== showingRef.current) showOrgan(organ);
  }, [showOrgan]);

  const handleOrganPick = (organId: string) => {
    scrollTo(organId);
    showOrgan(organData[organId]);
  };

  // Init scene
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new AnatomyScene(canvasRef.current);
    sceneRef.current = scene;

    const brain = organData.brain;
    scene.applyImmediate(fetchOrganPointsSync(brain), brain.colors);
    showingRef.current = 'brain';
    setActiveOrgan('brain');

    void showOrgan(brain);
    preloadOrgans(orderedOrgans);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [showOrgan]);

  // Scroll observer — tracks ALL section visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            ratiosRef.current.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
          });
          pickBestSection();
        },
        { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8] }
      );
      els.forEach((el) => obs.observe(el));
    }, 300);

    return () => clearTimeout(timer);
  }, [pickBestSection]);

  return (
    <div className="app-root">
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <LandingHeader />
      <div ref={canvasRef} className="canvas-wrap" />

      <main className="page-content">
        <HeroSection onExplore={() => handleOrganPick('brain')} />

        {orderedOrgans.map((organ, i) => (
          <OrganSection key={organ.id} organ={organ} index={i} isActive={activeOrgan === organ.id} />
        ))}

        <CTASection onScrollTo={scrollTo} />
      </main>

      <OrganDock activeId={activeOrgan} onSelect={handleOrganPick} />
      <ScrollNav sections={buildNavSections(orderedOrgans)} activeId={activeSection} onNavigate={scrollTo} />
    </div>
  );
};

export default App;
