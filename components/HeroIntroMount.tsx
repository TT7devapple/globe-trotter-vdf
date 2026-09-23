'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

/**
 * Monte l'intro animée du hero.
 *
 * Ce petit composant existe pour deux raisons précises :
 *
 * 1. **three.js est chargé à la demande.** Importé directement, il rejoignait
 *    le paquet initial de la page d'accueil et la faisait passer de 125 ko à
 *    262 ko de JavaScript. Ici, `next/dynamic` le sort du chemin critique.
 *
 * 2. **La Terre est visible immédiatement.** L'image de repli est rendue par
 *    le serveur, dans ce composant plutôt que dans l'intro : elle s'affiche
 *    donc dès le premier octet, puis s'efface quand la scène 3D prend le
 *    relais. Si WebGL est indisponible ou que les textures échouent, elle
 *    reste — le hero n'est jamais vide.
 *
 * L'intro est un enfant DIRECT de ce conteneur, et non de la couche de fond :
 * elle place elle-même son fond en `-z-10` et son avion en `z-10`, ce dernier
 * devant pouvoir passer devant le titre.
 */
const HeroIntro = dynamic(() => import('./HeroIntro'), { ssr: false });

export default function HeroIntroMount() {
  const [ready, setReady] = useState(false);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Terre statique : affichée d'emblée, puis effacée en fondu */}
      <div
        className={`absolute inset-0 -z-10 bg-void transition-opacity duration-700 ${
          ready ? 'opacity-0' : 'opacity-100'
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
          className="absolute left-1/2 top-[40%] h-auto w-[110vw] max-w-none -translate-x-1/2 -translate-y-1/2
                     lg:left-[58.5%] lg:top-1/2 lg:h-[92vh] lg:w-auto"
        />
      </div>

      <HeroIntro onReady={() => setReady(true)} />
    </div>
  );
}
