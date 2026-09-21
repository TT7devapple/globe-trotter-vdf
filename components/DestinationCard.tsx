import Link from 'next/link';
import type { MenuCategory } from '@/data/menu';
import { findDestination } from '@/data/menu';
import { formatCoordinates } from '@/lib/worldmap';
import DishIllustration from './DishIllustration';

const ACCENT = {
  aurora: { text: 'text-aurora', glow: 'rgba(61,224,255,0.30)' },
  ember: { text: 'text-ember', glow: 'rgba(255,122,69,0.30)' },
  saffron: { text: 'text-saffron', glow: 'rgba(255,194,75,0.28)' },
  plasma: { text: 'text-plasma', glow: 'rgba(124,92,255,0.30)' },
  jade: { text: 'text-jade', glow: 'rgba(52,229,160,0.28)' },
} as const;

/**
 * Carte d'un univers culinaire, présentée comme une escale.
 *
 * Structure reprise des fiches de destination : un numéro d'escale, un code,
 * le visuel, puis deux champs de données — ORIGINE et STYLE — traités comme
 * les lignes d'un panneau d'embarquement. Le reste du contenu se déploie au
 * survol et au focus clavier.
 *
 * Le halo coloré n'apparaît qu'au survol, et sa teinte suit celle de la
 * destination : il relie visuellement la carte à son point sur le globe.
 */
export default function DestinationCard({
  category,
  index,
}: {
  category: MenuCategory;
  index: number;
}) {
  const destination = findDestination(category.destinationId);
  const accent = ACCENT[destination?.accent ?? 'aurora'];

  return (
    <Link
      href={`/menu#${category.id}`}
      className="group relative block overflow-hidden rounded-panel border border-white/10 bg-hull
                 transition-all duration-500 hover:-translate-y-1 hover:border-white/25
                 focus-visible:border-aurora/50"
    >
      {/* Halo au survol, teinté selon la destination */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-panel opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 24px 70px -28px ${accent.glow}, inset 0 0 0 1px ${accent.glow}` }}
      />

      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
        <DishIllustration
          kind={category.illustration}
          accent={destination?.accent ?? 'aurora'}
          variant="card"
          className="absolute inset-0 h-full w-full"
        />

        {/* En-tête : numéro d'escale et code */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <span aria-hidden="true" className="font-mono text-micro-sm uppercase text-white/45">
            {String(index + 1).padStart(2, '0')}
          </span>
          {destination && (
            <span
              aria-hidden="true"
              className={`font-mono text-micro-sm uppercase ${accent.text}`}
            >
              {destination.code}
            </span>
          )}
        </div>

        {/* Pied : nom, données, description au survol */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-2xl font-semibold uppercase leading-tight text-white">
            {destination?.name ?? category.name}
          </h3>

          {/* Deux champs de données, façon panneau d'embarquement */}
          <dl className="mt-3 flex gap-6 border-t border-white/15 pt-3">
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                Origine
              </dt>
              <dd className="mt-1 font-mono text-micro-sm uppercase text-white/85">
                {destination?.name ?? 'Buffet'}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                Style
              </dt>
              <dd className="mt-1 font-mono text-micro-sm uppercase text-white/85">
                {category.short}
              </dd>
            </div>
          </dl>

          {/* Déployé au survol et au focus clavier */}
          <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <p className="pt-3 text-sm leading-relaxed text-white/75">{category.intro}</p>
              <p className="pt-2 font-mono text-micro-sm uppercase text-white/60">
                {category.items
                  .slice(0, 3)
                  .map((i) => i.name)
                  .join(' · ')}
              </p>
              {destination && (
                <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                  {formatCoordinates(destination.lat, destination.lng)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filet lumineux au survol */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r
                     from-transparent via-white/60 to-transparent opacity-0
                     transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
