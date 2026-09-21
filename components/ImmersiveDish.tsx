import Link from 'next/link';
import { findCategory, findDestination } from '@/data/menu';
import { formatCoordinates } from '@/lib/worldmap';
import DishIllustration from './DishIllustration';
import Reveal from './Reveal';

/**
 * Séquence immersive pleine largeur.
 *
 * Une escale sort du rythme de la grille et occupe tout l'écran : visuel en
 * pleine largeur, titre démesuré, données de vol sur le côté. C'est la
 * respiration du parcours — la grille reprend juste après.
 *
 * Le contenu provient entièrement de data/menu.ts : la section suit la carte
 * réelle du buffet et ne peut pas afficher un univers qui n'existe pas.
 */
export default function ImmersiveDish({
  categoryId,
  /** Numéro d'escale affiché, pour rester cohérent avec la grille. */
  step,
}: {
  categoryId: string;
  step: number;
}) {
  const category = findCategory(categoryId);
  if (!category) return null;

  const destination = findDestination(category.destinationId);
  const accent = destination?.accent ?? 'aurora';

  return (
    <section
      aria-labelledby={`immersif-${category.id}`}
      className="relative isolate flex min-h-[85svh] items-end overflow-hidden"
    >
      {/* Planche pleine largeur (grand écran) : le dessin occupe la droite */}
      <div className="absolute inset-0 -z-10 bg-[#070B12]">
        <DishIllustration
          kind={category.illustration}
          accent={accent}
          variant="feature"
          figure={step}
          className="hidden h-full w-full lg:block"
        />
        {/* Voiles : le texte se pose en bas à gauche, il doit primer */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-void/90 via-void/30 to-transparent lg:block" />
      </div>

      <div className="shell w-full pb-16 pt-28 md:pb-24">
        {/* Sur mobile, la planche passe au-dessus du texte plutôt que dessous */}
        <Reveal className="mb-10 lg:hidden">
          <div className="aspect-[4/3] overflow-hidden rounded-panel border border-white/10">
            <DishIllustration
              kind={category.illustration}
              accent={accent}
              variant="panel"
              figure={step}
              className="h-full w-full"
            />
          </div>
        </Reveal>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-aurora to-transparent" />
                Escale {String(step).padStart(2, '0')}
                {destination && (
                  <>
                    <span aria-hidden="true" className="text-steel/40">/</span>
                    <span className="text-aurora">{destination.code}</span>
                  </>
                )}
              </p>
            </Reveal>

            <Reveal delay={90}>
              <h2
                id={`immersif-${category.id}`}
                className="mt-5 font-display text-display-lg font-bold uppercase leading-[0.85]"
              >
                {category.name}
              </h2>
            </Reveal>

            <Reveal delay={170}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-titanium">{category.intro}</p>
            </Reveal>

            <Reveal delay={240}>
              <ul className="mt-7 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 font-mono text-micro-sm uppercase text-titanium backdrop-blur-sm"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={310}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={`/menu#${category.id}`} className="btn btn-ghost">
                  Voir cet univers
                </Link>
                <Link href="/reserver" className="btn btn-primary">
                  Réserver une table
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Données de vol */}
          <Reveal delay={200} className="shrink-0">
            <dl className="grid grid-cols-2 gap-x-10 gap-y-5 border-t border-white/15 pt-6 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <Field label="Origine" value={destination?.name ?? 'Buffet'} />
              <Field label="Style" value={category.short} />
              <Field label="Service" value="Midi et soir" />
              <Field label="Formule" value="À volonté" />
              {destination && (
                <div className="col-span-2 lg:col-span-1">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel/60">
                    Position
                  </dt>
                  <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                    {formatCoordinates(destination.lat, destination.lng)}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel/60">{label}</dt>
      <dd className="mt-1.5 font-display text-lg uppercase text-chrome">{value}</dd>
    </div>
  );
}
