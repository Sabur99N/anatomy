import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.15,
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add('lenis');

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  const scrollTo = useCallback((target: string, options?: { offset?: number; duration?: number }) => {
    const id = target.replace('#', '');
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(`#${id}`, {
        offset: options?.offset ?? 0,
        duration: options?.duration ?? 1.2,
      });
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return { scrollTo };
}
