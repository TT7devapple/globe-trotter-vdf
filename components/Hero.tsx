import Link from 'next/link';
import { RESTAURANT } from '@/data/restaurant';
import OpenStatus from './OpenStatus';
import HeroIntroMount from './HeroIntroMount';

/**
 * HERO
 * ==========================================================================
 * Composition : une Terre en rotation occupe la moitié droite de l'écran sur
 * grand format, le texte tient la moitié gauche. Sur mobile, le globe passe
 * derrière le texte, en partie hors cadre, et un voile assure la lisibilité.
 *
 * ── Choix de mise en page ────────────────────────────────────────────────
 * Le globe est décalé à droite plutôt que centré derrière le titre. Centré,
 * il imposait un compromis perdant : soit assombrir la Terre au point de
 * gâcher la texture, soit poser du texte blanc sur des océans clairs.
 * Décalé, les deux éléments coexistent à pleine intensité. Sur mobile, où il
 * n'y a pas la place pour deux colonnes, le globe occupe le haut de l'écran
 * et le texte se pose dessous, sur un voile dégradé.
 *
 * ── Résistance à l'échec ─────────────────────────────────────────────────
 * Ce composant est rendu sur le serveur, et le texte est révélé par des
 * animations CSS — jamais par un état JavaScript. Titre, accroche et boutons
 * restent donc lisibles même si three.js ne se charge jamais. Seul le globe
 * est un composant client, chargé à la demande.
 */
export default function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-28 md:justify-center md:pb-24"
      aria-labelledby="hero-titre"
    >
      {/*
        Intro animée : la Terre apparaît, l'avion en fait le tour, puis le
        globe continue de tourner. Le composant pose lui-même sa couche de
        fond (-z-10) ET sa couche avant (z-10) : il doit donc être un enfant
        DIRECT de la section. three.js y est chargé à la demande. Placé dans le conteneur de fond ci-dessous, son
        avion resterait prisonnier du plan négatif et passerait derrière le
        titre au lieu de devant.
      */}
      <HeroIntroMount />

      {/* ——————————————— Voiles, entre le globe et le texte ——————————————— */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Grille d'interface, très discrète par-dessus l'espace */}
        <div className="absolute inset-0 grid-bg opacity-[0.28]" />

        {/*
          Voiles de lisibilité.
          Sur mobile, le texte passe sous le globe : le voile monte depuis le
          bas. Sur grand écran, le texte est à gauche : le voile vient de la
          gauche et laisse la Terre intacte à droite.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/75 to-void/25 lg:hidden" />
        <div className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-void lg:via-void/88 lg:via-40% lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/* ——————————————— Contenu ——————————————— */}
      <div className="shell relative">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="eyebrow animate-fade-up delay-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-aurora">World Dining Experience</span>
            <span aria-hidden="true" className="text-steel/40">/</span>
            <span>Buffet à volonté</span>
            <span aria-hidden="true" className="text-steel/40">/</span>
            <span>{RESTAURANT.terminalCode}</span>
          </p>

          <h1 id="hero-titre" className="animate-fade-up delay-4 mt-5">
            <span className="block font-display text-display-xl font-bold uppercase leading-[0.82] text-chrome">
              Globe
              <br />
              <span className="text-gradient-aurora">Trotter</span>
            </span>
            <span className="mt-4 block font-mono text-micro uppercase text-titanium md:text-sm md:tracking-[0.36em]">
              Val de Fontenay
            </span>
          </h1>

          <p className="animate-fade-up delay-5 mt-7 font-display text-2xl leading-tight text-chrome md:text-3xl">
            {RESTAURANT.claim}
          </p>

          <p className="animate-fade-up delay-5 mt-4 max-w-lg text-base leading-relaxed text-titanium md:text-lg">
            Sushi, wok, grillades, pizza, fruits de mer, pâtisseries. Six escales et un seul tarif,
            au cœur du centre commercial Val de Fontenay.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="animate-fade-up delay-6 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/reserver" className="btn btn-primary group">
            <span className="relative z-10">Réserver une table</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-0 motion-safe:animate-sweep bg-aurora-sweep opacity-0 group-hover:opacity-100"
            />
            <ArrowIcon />
          </Link>
          <Link href="/menu" className="btn btn-ghost">
            Découvrir le buffet
          </Link>
          <Link href="/formules" className="btn btn-ghost">
            Voir les formules
          </Link>
        </div>

        {/* Bandeau d'informations, façon panneau d'embarquement */}
        <div className="animate-fade-in delay-6 mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
          <OpenStatus />
          <span className="font-mono text-micro-sm uppercase text-steel">
            {RESTAURANT.address.venue}
          </span>
          <a
            href={`tel:${RESTAURANT.phone.tel}`}
            className="font-mono text-micro-sm uppercase text-titanium underline decoration-white/20 underline-offset-4 transition-colors hover:text-chrome hover:decoration-aurora"
          >
            {RESTAURANT.phone.display}
          </a>
        </div>
      </div>

      {/*
        Amorce de trajectoire vers la section suivante : une impulsion
        lumineuse descend le long d'un filet vertical. C'est le lien visuel
        entre « la Terre » et « les escales » qui suivent.
      */}
      <div
        aria-hidden="true"
        className="animate-fade-in delay-6 shell relative mt-10 hidden md:mt-16 md:block"
      >
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-steel/50">
          <span className="relative block h-12 w-px overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 -top-5 h-5 bg-gradient-to-b from-transparent via-aurora to-transparent motion-safe:animate-[trace_2.8s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
          </span>
          Départ imminent
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
