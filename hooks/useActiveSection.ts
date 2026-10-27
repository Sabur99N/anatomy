import { useEffect, useState, useCallback, useRef } from 'react';

export function useActiveSection(sectionIds: string[], scrollToExternal?: (id: string) => void) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? 'hero');
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const scrollTo = useCallback(
    (id: string) => {
      if (scrollToExternal) {
        scrollToExternal(id);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    },
    [scrollToExternal]
  );

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.15)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id !== activeRef.current) setActiveId(id);
        }
      },
      { threshold: [0.15, 0.3, 0.5, 0.7], rootMargin: '-10% 0px -10% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [sectionIds]);

  return { activeId, scrollTo };
}
