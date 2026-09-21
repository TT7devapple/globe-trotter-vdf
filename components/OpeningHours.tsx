import { SERVICES, OPEN_DAYS, DAY_LABELS_SHORT } from '@/data/openingHours';
import { VERIFICATION } from '@/data/verification';
import { RESTAURANT } from '@/data/restaurant';
import OpenStatus from './OpenStatus';

/**
 * Horaires d'ouverture.
 *
 * L'avertissement affiché sous le tableau n'est pas décoratif : les sources
 * publiques se contredisent (voir data/openingHours.ts). Tant que le
 * restaurant n'a pas tranché, le visiteur doit pouvoir le savoir — d'où
 * l'invitation à appeler, mise au même niveau visuel que les horaires.
 */
export default function OpeningHours({ compact = false }: { compact?: boolean }) {
  const verified = VERIFICATION.openingHours.verified;
  const allDays = OPEN_DAYS.length === 7;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Horaires</p>
        <OpenStatus />
      </div>

      <dl className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {SERVICES.map((service) => (
          <div key={service.id} className="flex items-baseline justify-between gap-4 px-5 py-4">
            <dt className="font-mono text-micro-sm uppercase text-steel">{service.label}</dt>
            <dd className="font-display text-xl tabular-nums text-chrome">
              {service.opens.replace(':', 'h')}
              <span className="mx-2 text-steel/50">—</span>
              {service.closes.replace(':', 'h')}
            </dd>
          </div>
        ))}
      </dl>

      {!compact && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Jours d'ouverture">
          {DAY_LABELS_SHORT.map((label, index) => {
            const open = OPEN_DAYS.includes(index);
            return (
              <span
                key={label}
                role="listitem"
                className={`rounded-lg border px-2.5 py-1.5 font-mono text-micro-sm uppercase ${
                  open
                    ? 'border-jade/25 bg-jade/[0.07] text-jade'
                    : 'border-white/5 bg-white/[0.02] text-steel/40 line-through'
                }`}
              >
                <span className="sr-only">{open ? 'Ouvert ' : 'Fermé '}</span>
                {label}
              </span>
            );
          })}
        </div>
      )}

      {allDays && (
        <p className="font-mono text-micro-sm uppercase text-jade">Ouvert 7 jours sur 7</p>
      )}

      {!verified && (
        <p className="flex items-start gap-2.5 rounded-xl border border-saffron/20 bg-saffron/[0.05] px-4 py-3 text-[13px] leading-relaxed text-saffron/90">
          <span aria-hidden="true" className="mt-px shrink-0">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 1.5 15 14H1L8 1.5Zm0 4.2a.8.8 0 0 0-.8.8v2.6a.8.8 0 0 0 1.6 0V6.5a.8.8 0 0 0-.8-.8Zm0 5.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
            </svg>
          </span>
          <span>
            Ces horaires proviennent de sources publiques qui ne concordent pas toutes.{' '}
            <a
              href={`tel:${RESTAURANT.phone.tel}`}
              className="font-medium underline decoration-saffron/40 underline-offset-2 hover:decoration-saffron"
            >
              Appelez le {RESTAURANT.phone.display}
            </a>{' '}
            pour confirmer avant de vous déplacer.
          </span>
        </p>
      )}
    </div>
  );
}
