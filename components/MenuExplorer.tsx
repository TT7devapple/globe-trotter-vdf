'use client';

import { useMemo, useState } from 'react';
import { ALLERGENS, MENU, findDestination, menuFilters, type MenuCategory, type MenuItem } from '@/data/menu';
import DishIllustration from './DishIllustration';
import { formatCoordinates } from '@/lib/worldmap';

/**
 * Exploration du buffet.
 *
 * Le buffet est à volonté : aucun prix n'est affiché à côté d'un plat, ce qui
 * n'aurait pas de sens ici. Chaque catégorie est présentée comme une escale,
 * avec ses coordonnées et son code.
 *
 * Sur mobile, les filtres défilent horizontalement et restent collés en haut
 * pendant le défilement vertical : on garde toujours l'accès aux autres
 * univers sans remonter.
 */
export default function MenuExplorer() {
  const filters = useMemo(() => menuFilters(), []);
  const [active, setActive] = useState('tout');
  const [veggieOnly, setVeggieOnly] = useState(false);

  const categories = useMemo(() => {
    const base = active === 'tout' ? MENU : MENU.filter((c) => c.id === active);
    if (!veggieOnly) return base;
    return base
      .map((category) => ({ ...category, items: category.items.filter((i) => i.veggie) }))
      .filter((category) => category.items.length > 0);
  }, [active, veggieOnly]);

  const totalShown = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div>
      {/* ——— Barre de filtres ——— */}
      <div className="sticky top-16 z-30 -mx-4 border-y border-white/10 bg-void/90 px-4 backdrop-blur-xl md:top-20 md:mx-0 md:rounded-2xl md:border">
        <div className="scroll-x gap-2 py-3" role="tablist" aria-label="Filtrer par univers">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active === filter.id}
              onClick={() => setActive(filter.id)}
              className={`shrink-0 scroll-ml-4 whitespace-nowrap rounded-full border px-4 py-2.5
                          font-mono text-micro-sm uppercase transition-all duration-300 ${
                            active === filter.id
                              ? 'border-aurora/45 bg-aurora/[0.1] text-chrome'
                              : 'border-white/10 bg-white/[0.02] text-steel hover:border-white/25 hover:text-titanium'
                          }`}
              style={{ scrollSnapAlign: 'start', minHeight: 44 }}
            >
              {filter.short}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/5 py-2.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={veggieOnly}
              onChange={(e) => setVeggieOnly(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-jade"
            />
            <span className="font-mono text-micro-sm uppercase text-titanium">
              Végétarien uniquement
            </span>
          </label>
          <p aria-live="polite" className="font-mono text-micro-sm uppercase text-steel">
            {totalShown} entrée{totalShown > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ——— Catégories ——— */}
      <div className="mt-12 space-y-20">
        {categories.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-10 text-center text-titanium">
            Aucune entrée végétarienne identifiée dans cet univers. Demandez sur place : les équipes
            vous orienteront.
          </p>
        )}

        {categories.map((category) => {
          const destination = findDestination(category.destinationId);

          return (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`${category.id}-titre`}
              className="scroll-mt-40"
            >
              <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  {destination && (
                    <p className="eyebrow flex items-center gap-3">
                      <span className="text-aurora">{destination.code}</span>
                      <span aria-hidden="true" className="text-steel/40">/</span>
                      {destination.name}
                    </p>
                  )}
                  <h2
                    id={`${category.id}-titre`}
                    className="mt-3 font-display text-display-sm font-semibold uppercase"
                  >
                    {category.name}
                  </h2>
                  <p className="mt-3 max-w-2xl text-titanium">{category.intro}</p>
                </div>

                {destination && (
                  <p
                    aria-hidden="true"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45"
                  >
                    {formatCoordinates(destination.lat, destination.lng)}
                  </p>
                )}
              </header>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <ItemCard item={item} category={category} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ItemCard({ item, category }: { item: MenuItem; category: MenuCategory }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-hull transition-all duration-500 hover:-translate-y-1 hover:border-white/25">
      <div className="relative aspect-[16/10] overflow-hidden">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <DishIllustration
            kind={item.illustration ?? category.illustration}
            accent={findDestination(category.destinationId)?.accent ?? (item.veggie ? 'jade' : 'aurora')}
            className="h-full w-full"
          />
        )}

        {item.signature && (
          <span className="absolute left-3 top-3 rounded-full border border-saffron/40 bg-void/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-saffron backdrop-blur-sm">
            Signature
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-chrome">{item.name}</h3>
        {item.description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-steel">{item.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {item.veggie && (
            <span className="chip border-jade/25 bg-jade/[0.07] text-jade">Végétarien</span>
          )}
          {item.allergens?.map((allergen) => (
            <span key={allergen} className="chip border-white/10 bg-white/[0.03] text-steel">
              {ALLERGENS[allergen]}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
