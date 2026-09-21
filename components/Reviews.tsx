import { GOOGLE_RATING, publishableReviews } from '@/data/reviews';
import { FEATURES } from '@/data/verification';
import { RESTAURANT } from '@/data/restaurant';
import { Section, SectionHeader } from './Section';

/**
 * Section « Ils ont voyagé avec nous ».
 *
 * Choix assumé : tant qu'aucun avis n'a été recueilli avec l'accord de son
 * auteur, on n'en affiche aucun. Recopier des avis Google sur un site
 * commercial pose un problème de droits, et des témoignages inventés se
 * repèrent immédiatement — ils coûtent plus de crédibilité qu'ils n'en
 * rapportent.
 *
 * À la place : un renvoi direct vers les avis Google, où le visiteur lira
 * l'avis brut, positif comme négatif. C'est plus honnête, et un visiteur qui
 * vérifie de lui-même a plus confiance qu'un visiteur à qui l'on montre une
 * sélection.
 */
export default function Reviews() {
  const reviews = publishableReviews();
  const showRating = FEATURES.showGoogleRating && GOOGLE_RATING !== null;

  return (
    <Section tone="deep" labelledBy="avis-titre">
      <div className="shell">
        <SectionHeader
          eyebrow="Ils ont voyagé avec nous"
          id="avis-titre"
          align="center"
          title="Ce que disent nos clients"
          lead="Les avis sont publiés directement sur Google, sans filtre et sans sélection de notre part."
        />

        <div className="mx-auto mt-12 max-w-3xl">
          {showRating && GOOGLE_RATING ? (
            <div className="glass flex flex-col items-center gap-4 rounded-panel px-8 py-10 text-center">
              <p className="eyebrow">Note Google</p>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-7xl font-bold tabular-nums text-chrome">
                  {GOOGLE_RATING.value.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
                </span>
                <span className="font-display text-2xl text-steel">/ 5</span>
              </p>
              <Stars value={GOOGLE_RATING.value} />
              <p className="text-sm text-titanium">
                {GOOGLE_RATING.count.toLocaleString('fr-FR')} avis Google
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/60">
                Relevé le {GOOGLE_RATING.checkedOn}
              </p>
            </div>
          ) : (
            <div className="glass rounded-panel px-8 py-10 text-center">
              <p className="text-lg leading-relaxed text-titanium">
                Plusieurs centaines de clients ont laissé un avis sur notre fiche Google.
                <span className="block text-chrome">
                  Allez les lire : c’est là que vous vous ferez la meilleure idée.
                </span>
              </p>
              <p className="mt-5 text-sm leading-relaxed text-steel">
                Nous n’affichons pas de note chiffrée ici : elle change en permanence, et une note
                figée dans une page finit toujours par devenir fausse.
              </p>
            </div>
          )}

          {reviews.length > 0 && (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-2xl border border-white/10 bg-hull p-6">
                  <Stars value={review.rating} />
                  <blockquote className="mt-4 text-sm leading-relaxed text-titanium">
                    <p>« {review.text} »</p>
                  </blockquote>
                  <footer className="mt-4 flex items-center justify-between">
                    <cite className="not-italic font-mono text-micro-sm uppercase text-chrome">
                      {review.author}
                    </cite>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      {review.date}
                    </span>
                  </footer>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={RESTAURANT.links.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Voir tous les avis
              <span className="sr-only"> sur Google (nouvelle fenêtre)</span>
              <ExternalIcon />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <p className="flex items-center gap-1" aria-label={`${value.toLocaleString('fr-FR')} sur 5`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index + 1));
        return (
          <span key={index} aria-hidden="true" className="relative block h-4 w-4">
            <StarIcon className="absolute inset-0 text-white/15" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon className="h-4 w-4 text-saffron" />
            </span>
          </span>
        );
      })}
    </p>
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${className}`} fill="currentColor" aria-hidden="true">
      <path d="M10 1.5l2.47 5.26 5.53.77-4 4.03.95 5.69L10 14.6l-4.95 2.65.95-5.69-4-4.03 5.53-.77L10 1.5z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3h7v7M13 3 6.5 9.5M11 9.5V13H3V5h3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
