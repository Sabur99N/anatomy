import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-animate="hero-badge"]', {
        y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
      });
      gsap.from('[data-animate="hero-title"]', {
        y: 50, opacity: 0, duration: 1, delay: 0.35, ease: 'power3.out',
      });
      gsap.from('[data-animate="hero-sub"]', {
        y: 24, opacity: 0, duration: 0.8, delay: 0.55, ease: 'power3.out',
      });
      gsap.from('[data-animate="hero-cta"]', {
        y: 16, opacity: 0, duration: 0.7, delay: 0.75, ease: 'power3.out',
      });

      gsap.utils.toArray<HTMLElement>('[data-animate="section-content"]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
          y: 40, opacity: 0, duration: 0.9, ease: 'power2.out',
        });
      });

      gsap.from('[data-animate="cta"]', {
        scrollTrigger: { trigger: '[data-animate="cta"]', start: 'top 80%', toggleActions: 'play none none none' },
        y: 30, opacity: 0, duration: 0.9, ease: 'power2.out',
      });
    });

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);
}
