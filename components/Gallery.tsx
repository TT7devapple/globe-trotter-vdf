import { GALLERY, hasRealPhotos } from '@/data/images';
import Visual from './Visual';
import DishIllustration from './DishIllustration';

/**
 * Galerie en grille asymétrique.
 *
 * Les emplacements sont dimensionnés et composés ; seules les photographies
 * manquent (voir data/images.ts). La mention affichée en tête n'est pas un
 * aveu d'inachèvement mais une information : le visiteur comprend qu'il voit
 * des compositions graphiques et non des photos retouchées du restaurant.
 */
const SPANS = {
  large: 'col-span-2 row-span-2 aspect-square',
  tall: 'col-span-1 row-span-2 aspect-[1/2]',
  wide: 'col-span-2 row-span-1 aspect-[2/1]',
  square: 'col-span-1 row-span-1 aspect-square',
} as const;

export default function Gallery({ limit }: { limit?: number }) {
  const entries = limit ? GALLERY.slice(0, limit) : GALLERY;
  const real = hasRealPhotos();

  return (
    <div>
      {!real && (
        <p className="mb-6 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-steel">
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-aurora">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 8H7V7h2v5Z" />
            </svg>
          </span>
          <span>
            Les visuels ci-dessous sont des <strong className="text-titanium">illustrations</strong>{' '}
            des univers du buffet, pas des photographies du restaurant. Nous préférons un dessin
            assumé à une photo de banque d’images qui ne correspondrait pas à ce que vous trouverez
            sur place.
          </span>
        </p>
      )}

      <ul className="grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {entries.map((entry, index) => (
          <li key={entry.id} className={`${SPANS[entry.span]} group relative overflow-hidden rounded-2xl border border-white/10`}>
            {entry.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.src}
                alt={entry.alt}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
            ) : entry.illustration ? (
              <DishIllustration kind={entry.illustration} accent={entry.accent} className="h-full w-full" />
            ) : (
              <Visual
                id={entry.id}
                accent={entry.accent}
                className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105"
                label={entry.caption}
              />
            )}

            {/* Légende, révélée au survol */}
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-void/85 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <p className="font-display text-lg uppercase text-white">{entry.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
