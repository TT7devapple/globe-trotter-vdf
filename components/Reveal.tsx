'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Apparition à l'entrée dans le champ de vision.
 *
 * Un seul IntersectionObserver par élément, déconnecté dès le déclenchement :
 * l'animation ne se rejoue pas au défilement inverse, et rien ne continue à
 * observer une fois la page parcourue.
 *
 * Le contenu est rendu sur le serveur et présent dans le DOM dès le premier
 * octet : seule son opacité est animée. Sans JavaScript, ou avec « réduire
 * les animations », tout est visible immédiatement.
 */
export default function Reveal({
  children,
  delay = 0,
  /** Amplitude du déplacement vertical, en pixels. */
  distance = 26,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  /*
   * `as` est restreint à quatre balises qui acceptent exactement les mêmes
   * attributs et une référence d'élément. On le réduit ici à un type concret
   * pour que TypeScript n'ait pas à résoudre l'intersection des quatre types
   * de référence — ce qui est insoluble et sans objet ici. La balise
   * réellement rendue reste celle passée en propriété.
   */
  const Tag = as as 'div';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Déclenche un peu avant l'entrée réelle, pour que l'élément soit déjà
      // en place quand le regard l'atteint.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${distance}px)`,
        transition: `opacity 850ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 850ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
