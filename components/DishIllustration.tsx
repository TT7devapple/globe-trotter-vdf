'use client';

import { useEffect, useRef, useState } from 'react';
import type { IllustrationKind } from '@/data/menu';
import { ACCENT_HEX, ART, KIND_LABEL, NOTES, PALETTE, type Note } from './dishes/art';

type Accent = keyof typeof ACCENT_HEX;

/**
 * Formats :
 *  - `tile`    petite vignette (carte de plat, galerie) — dessin seul ;
 *  - `card`    carte d'escale — dessin en haut, annotations dès 640 px ;
 *  - `panel`   encadré autonome — dessin centré, annotations, repères ;
 *  - `feature` fond de section pleine largeur — dessin à droite, repères.
 */
type Variant = 'tile' | 'card' | 'panel' | 'feature';

const BOX: Record<Variant, string> = {
  tile: 'absolute inset-[5%]',
  card: 'absolute inset-x-[3%] top-[9%] h-[58%]',
  panel: 'absolute inset-[7%]',
  feature: 'absolute bottom-[24%] left-[43%] right-[21%] top-[11%]',
};

/**
 * Illustration d'un plat, dans le style « planche technique » du site.
 *
 * ── Tracé animé ─────────────────────────────────────────────────────────
 * Rendu sur le serveur, le dessin est d'abord complet : sans JavaScript, ou
 * avec « réduire les animations », il s'affiche tel quel. Une fois monté, le
 * composant ne « réarme » le tracé que si le dessin est encore sous la ligne
 * de flottaison — l'utilisateur ne voit jamais un dessin disparaître pour se
 * redessiner. Le tracé se déclenche à l'entrée dans le champ de vision.
 */
export default function DishIllustration({
  kind,
  accent = 'aurora',
  variant = 'tile',
  figure,
  className = '',
}: {
  kind: IllustrationKind;
  accent?: Accent;
  variant?: Variant;
  /** Numéro de planche affiché en `panel` et `feature` */
  figure?: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<'static' | 'armed' | 'drawing'>('static');
  const Art = ART[kind];
  const hex = ACCENT_HEX[accent];
  const rgb = hexToRgb(hex);
  const framed = variant === 'panel' || variant === 'feature';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Déjà visible au montage : on laisse le dessin tel quel.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState('drawing');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      role="img"
      aria-label={`Illustration : ${KIND_LABEL[kind]}`}
      className={`relative overflow-hidden bg-[#070B12] ${className}`}
    >
      {/* Grille de fond */}
      <div aria-hidden="true" className="absolute inset-0 grid-bg opacity-40" />

      <div aria-hidden="true" className={BOX[variant]}>
        {/* Projecteur centré sur le dessin, plus vif au survol */}
        <div
          className="absolute -inset-[18%] opacity-70 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(50% 46% at 50% 54%, rgba(${rgb},0.2), transparent 72%)`,
          }}
        />

        <div className="relative h-full w-full transition-transform duration-[900ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.035]">
          <svg
            ref={ref}
            data-state={state}
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid meet"
            className="dish-art h-full w-full overflow-visible"
          >
            <Art />
            {variant !== 'tile' && (
              <Notes
                notes={NOTES[kind]}
                accent={hex}
                className={variant === 'card' ? 'hidden sm:inline' : undefined}
              />
            )}
          </svg>
        </div>

        {framed && <FrameMarks figure={figure} label={KIND_LABEL[kind]} />}
      </div>

      {/* Vignetage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 90px 20px rgba(0,0,0,0.55)' }}
      />
    </div>
  );
}

/** Filets d'annotation, dessinés après l'illustration. */
function Notes({ notes, accent, className }: { notes: Note[]; accent: string; className?: string }) {
  return (
    <g className={className}>
      {notes.map((note) => {
        const [x, y] = note.at;
        const [tx, ty] = note.to;
        const dir = note.side === 'left' ? -1 : 1;
        const end = tx + 16 * dir;
        return (
          <g key={note.label}>
            <circle cx={x} cy={y} r={5} fill="none" stroke={accent} strokeOpacity={0.4} strokeWidth={0.6} className="df d4" />
            <circle cx={x} cy={y} r={2} fill={accent} className="df d4" />
            <path
              d={`M${x} ${y} L${tx} ${ty} L${end} ${ty}`}
              fill="none"
              stroke={PALETTE.detail}
              strokeOpacity={0.55}
              strokeWidth={0.6}
              pathLength={1}
              className="ds d4"
            />
            <text
              x={end + 5 * dir}
              y={ty + 3}
              textAnchor={dir < 0 ? 'end' : 'start'}
              fill={PALETTE.detail}
              className="df d4"
              style={{ font: '500 8.5px var(--font-mono), ui-monospace, monospace', letterSpacing: '0.16em' }}
            >
              {note.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Repères de planche : coins, numéro, mention « illustration ». */
function FrameMarks({ figure, label }: { figure?: number; label: string }) {
  const corner = 'absolute h-4 w-4 border-aurora/40';
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
      <p className="absolute left-6 top-1 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">
        {figure !== undefined && <span className="text-aurora/70">Fig. {String(figure).padStart(2, '0')} · </span>}
        Illustration — {label}
      </p>
    </div>
  );
}

function hexToRgb(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
}
