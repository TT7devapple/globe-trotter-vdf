'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { GlobeQuality } from './Globe3D';
import { DESTINATIONS } from '@/data/menu';
import { formatCoordinates } from '@/lib/worldmap';

/**
 * Enveloppe du globe du hero.
 *
 * Elle décide *si* et *comment* le globe 3D est affiché, et fournit dans tous
 * les cas une Terre à l'écran :
 *
 *  1. l'image de repli (86 ko) est affichée immédiatement — elle sert à la
 *     fois de visuel de chargement et de solution définitive ;
 *  2. si WebGL est disponible et que l'utilisateur n'a pas demandé la
 *     réduction des animations, three.js est chargé à la demande, puis le
 *     globe animé apparaît en fondu par-dessus l'image ;
 *  3. en cas d'échec — WebGL absent, textures inaccessibles, appareil très
 *     limité — l'image reste. Il n'y a jamais d'écran vide.
 *
 * Le globe est purement décoratif : il porte `aria-hidden` et n'est jamais
 * dans le parcours de tabulation.
 */

// three.js ne s'exécute que dans le navigateur, et pèse plus lourd que le
// reste de la page réunie : il est chargé dynamiquement, hors du rendu serveur.
const Globe3D = dynamic(() => import('./Globe3D'), { ssr: false });

type Mode = 'checking' | 'static' | 'webgl';

/** WebGL est-il réellement utilisable ? */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!context) return false;

    // Certains environnements exposent un contexte purement logiciel, très
    // lent : on refuse explicitement le rendu logiciel connu.
    const debugInfo = (context as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(
        (context as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? ''
      ).toLowerCase();
      if (renderer.includes('swiftshader') || renderer.includes('llvmpipe')) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Niveau de détail adapté à l'appareil. */
function detectQuality(): GlobeQuality {
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  // Connexion lente ou mode économie de données : on évite les textures 2K.
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  const frugal = connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? '');

  // Seuil volontairement bas : un portable à quatre cœurs avec un GPU intégré
  // tient sans peine les 60 images/s sur cette scène. Réserver la qualité
  // réduite aux appareils réellement limités évite de dégrader tout le monde.
  if (narrow || cores < 4 || memory <= 2 || frugal) return 'low';
  return 'high';
}

export default function HeroGlobe() {
  const [mode, setMode] = useState<Mode>('checking');
  const [quality, setQuality] = useState<GlobeQuality>('low');
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    // « Réduire les animations » : on s'en tient à la Terre statique, comme
    // le demande le réglage système. Rien n'est perdu — c'est la même image.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !detectWebGL()) {
      setMode('static');
      return;
    }
    setQuality(detectQuality());
    setMode('webgl');
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ——— Terre statique : visible immédiatement, puis en dessous ——— */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
          globeReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/textures/earth-fallback.webp"
          alt=""
          width={900}
          height={900}
          decoding="async"
          fetchPriority="high"
          className="absolute left-1/2 top-[34%] h-auto w-[135vw] max-w-none -translate-x-1/2 -translate-y-1/2
                     sm:top-[40%] sm:w-[95vw] lg:left-[68%] lg:top-1/2 lg:w-[62vw] xl:w-[58vw]"
        />
      </div>

      {/* ——— Globe animé ——— */}
      {mode === 'webgl' && (
        <div
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
            globeReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Globe3D
            quality={quality}
            onReady={() => setGlobeReady(true)}
            className="absolute left-1/2 top-[34%] h-[135vw] w-[135vw] -translate-x-1/2 -translate-y-1/2
                       sm:top-[40%] sm:h-[95vw] sm:w-[95vw] lg:left-[68%] lg:top-1/2 lg:h-[62vw] lg:w-[62vw] xl:h-[58vw] xl:w-[58vw]"
          />
        </div>
      )}

      <GlobeHud />
    </div>
  );
}

/**
 * Habillage graphique autour du globe.
 *
 * En SVG et en DOM plutôt qu'en 3D : le texte reste net à toutes les
 * résolutions, et cela ne coûte rien au rendu par image. Ces éléments restent
 * volontairement discrets — c'est la Terre qui doit tenir le premier rôle.
 */
function GlobeHud() {
  const home = DESTINATIONS.find((d) => d.home) ?? DESTINATIONS[0];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Anneaux d'orbite, alignés sur le centre du globe */}
      <svg
        className="absolute left-1/2 top-[34%] h-[135vw] w-[135vw] -translate-x-1/2 -translate-y-1/2
                   sm:top-[40%] sm:h-[95vw] sm:w-[95vw] lg:left-[68%] lg:top-1/2 lg:h-[62vw] lg:w-[62vw] xl:h-[58vw] xl:w-[58vw]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <defs>
          <linearGradient id="orbit-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3DE0FF" stopOpacity="0" />
            <stop offset="45%" stopColor="#3DE0FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3DE0FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbit-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7A45" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF7A45" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#FF7A45" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Orbite inclinée, en rotation très lente */}
        <g className="origin-center motion-safe:animate-spin-slow">
          <ellipse
            cx="200"
            cy="200"
            rx="165"
            ry="58"
            stroke="url(#orbit-a)"
            strokeWidth="0.7"
            transform="rotate(-22 200 200)"
          />
        </g>

        <ellipse
          cx="200"
          cy="200"
          rx="176"
          ry="176"
          stroke="rgba(122,134,153,0.13)"
          strokeWidth="0.6"
          strokeDasharray="2 9"
        />

        <g className="origin-center motion-safe:animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          <ellipse
            cx="200"
            cy="200"
            rx="150"
            ry="150"
            stroke="url(#orbit-b)"
            strokeWidth="0.6"
            strokeDasharray="30 260"
          />
        </g>
      </svg>

      {/* Relevé de position, en bas à droite */}
      <div className="absolute bottom-6 right-4 hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-steel/40 md:block lg:bottom-10 lg:right-10">
        <p className="text-aurora/45">{home.code}</p>
        <p>{formatCoordinates(home.lat, home.lng)}</p>
        <p className="text-steel/30">Terre — vue orbitale</p>
      </div>
    </div>
  );
}
