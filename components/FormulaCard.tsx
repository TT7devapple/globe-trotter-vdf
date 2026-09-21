import Link from 'next/link';
import type { Formula } from '@/data/formulas';
import { formatPrice } from '@/data/formulas';
import { FEATURES } from '@/data/verification';
import { RESTAURANT } from '@/data/restaurant';

const ACCENTS = {
  aurora: { text: 'text-aurora', border: 'border-aurora/30', bg: 'bg-aurora/[0.05]' },
  ember: { text: 'text-ember', border: 'border-ember/35', bg: 'bg-ember/[0.06]' },
  saffron: { text: 'text-saffron', border: 'border-saffron/30', bg: 'bg-saffron/[0.05]' },
  plasma: { text: 'text-plasma', border: 'border-plasma/30', bg: 'bg-plasma/[0.05]' },
} as const;

/**
 * Carte d'une formule.
 *
 * Le bloc du prix est la zone la plus lourde visuellement. Quand le tarif
 * n'est pas confirmé (cas par défaut, voir data/formulas.ts), cette zone
 * n'est pas laissée vide : elle devient une invitation à appeler, traitée
 * avec le même soin typographique. Le visiteur obtient une réponse, et le
 * site n'affirme aucun montant.
 */
export default function FormulaCard({ formula }: { formula: Formula }) {
  const accent = ACCENTS[formula.accent];
  const showPrice = FEATURES.showPrices && typeof formula.price === 'number';

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-panel border
                  transition-all duration-500 hover:-translate-y-1 ${
                    formula.featured
                      ? `${accent.border} bg-hull shadow-panel`
                      : 'border-white/10 bg-hull/60 hover:border-white/25'
                  }`}
    >
      {formula.featured && (
        <span
          className={`absolute right-5 top-5 rounded-full border px-3 py-1 font-mono text-micro-sm uppercase ${accent.border} ${accent.bg} ${accent.text}`}
        >
          Le plus complet
        </span>
      )}

      <div className="p-6 md:p-8">
        <p className={`font-mono text-micro-sm uppercase ${accent.text}`}>{formula.code}</p>
        <h3 className="mt-3 font-display text-3xl font-semibold uppercase text-chrome">
          {formula.name}
        </h3>

        <dl className="mt-4 space-y-1">
          <div className="flex gap-2 text-sm">
            <dt className="sr-only">Jours</dt>
            <dd className="text-titanium">{formula.days}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Horaires</dt>
            <dd className="font-mono text-micro-sm uppercase text-steel">{formula.schedule}</dd>
          </div>
        </dl>
      </div>

      {/* ——— Zone tarif ——— */}
      <div className={`border-y border-white/10 px-6 py-6 md:px-8 ${accent.bg}`}>
        {showPrice ? (
          <p className="flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold tabular-nums leading-none text-chrome">
              {formatPrice(formula.price as number)}
            </span>
            <span className="font-mono text-micro-sm uppercase text-steel">/ {formula.unit}</span>
          </p>
        ) : (
          <div>
            <p className="font-display text-2xl font-semibold leading-tight text-chrome">
              Tarif communiqué
              <br />
              par téléphone
            </p>
            <a
              href={`tel:${RESTAURANT.phone.tel}`}
              className={`mt-3 inline-flex items-center gap-2 font-mono text-micro-sm uppercase
                          underline decoration-white/25 underline-offset-4 transition-colors
                          hover:decoration-current ${accent.text}`}
            >
              {RESTAURANT.phone.display}
            </a>
            <p className="mt-3 text-[12px] leading-relaxed text-steel">
              Les tarifs qui circulent en ligne pour cet établissement se contredisent. Plutôt que
              d’en afficher un au hasard, nous préférons vous donner le bon.
            </p>
          </div>
        )}
      </div>

      {/* ——— Contenu ——— */}
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="eyebrow">Ce qui est compris</p>
        <ul className="mt-4 flex-1 space-y-2.5">
          {formula.includes.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm leading-relaxed text-titanium">
              <span aria-hidden="true" className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent.text} bg-current`} />
              {line}
            </li>
          ))}
        </ul>

        {formula.conditions && formula.conditions.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-4">
            <ul className="space-y-1.5">
              {formula.conditions.map((line) => (
                <li key={line} className="text-[12px] leading-relaxed text-steel">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/reserver"
          className={`btn mt-6 w-full ${formula.featured ? 'btn-primary' : 'btn-ghost'}`}
        >
          Réserver
        </Link>
      </div>
    </article>
  );
}
