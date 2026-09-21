'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { RESTAURANT } from '@/data/restaurant';
import { formatLongDate } from '@/lib/datetime';

export type ConfirmedReservation = {
  reference: string;
  date: string;
  time: string;
  guests: number;
  firstName: string;
  status: string;
};

/**
 * Écran de fin de parcours.
 *
 * Le mot « confirmée » est volontairement absent : le restaurant valide
 * lui-même les demandes, et le statut réel est EN_ATTENTE. Annoncer une
 * table confirmée ici mettrait le restaurant en difficulté le jour venu.
 */
export default function ReservationConfirmation({
  reservation,
}: {
  reservation: ConfirmedReservation;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Déplace le focus sur le titre : un lecteur d'écran annonce le résultat
  // au lieu de rester silencieux après la disparition du formulaire.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="animate-scale-in">
      <div className="relative overflow-hidden rounded-panel border border-jade/25 bg-hull p-8 md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(70% 60% at 50% 0%, rgba(52,229,160,0.14), transparent 70%)',
          }}
        />

        <div className="relative">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-jade/35 bg-jade/[0.1]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-jade" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 font-display text-display-sm font-semibold uppercase outline-none"
          >
            Demande enregistrée
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-titanium">
            Merci {reservation.firstName}. Votre demande est bien arrivée, et le restaurant va la
            valider.
          </p>

          {/* Référence */}
          <div className="mt-8 inline-flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
            <span className="font-mono text-micro-sm uppercase text-steel">Votre référence</span>
            <span className="font-display text-3xl font-bold tracking-wider text-chrome">
              {reservation.reference}
            </span>
          </div>

          {/* Détails */}
          <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-micro-sm uppercase text-steel">Date</dt>
              <dd className="mt-1.5 text-chrome">{formatLongDate(reservation.date)}</dd>
            </div>
            <div>
              <dt className="font-mono text-micro-sm uppercase text-steel">Heure</dt>
              <dd className="mt-1.5 font-display text-xl tabular-nums text-chrome">
                {reservation.time.replace(':', 'h')}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-micro-sm uppercase text-steel">Convives</dt>
              <dd className="mt-1.5 font-display text-xl tabular-nums text-chrome">
                {reservation.guests}
              </dd>
            </div>
          </dl>

          {/* Ce qui se passe ensuite — la partie qui compte vraiment */}
          <div className="mt-8 rounded-2xl border border-saffron/25 bg-saffron/[0.05] p-5">
            <p className="font-mono text-micro-sm uppercase text-saffron">Et maintenant ?</p>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-saffron/90">
              <li className="flex gap-3">
                <span aria-hidden="true" className="font-mono">1.</span>
                <span>
                  Votre demande est <strong className="font-semibold">en attente de validation</strong> par
                  le restaurant. Elle n’est pas encore une table réservée.
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="font-mono">2.</span>
                <span>Le restaurant vous recontacte pour confirmer, ou vous proposer un autre créneau.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="font-mono">3.</span>
                <span>
                  Un doute, un changement, une annulation ? Appelez le{' '}
                  <a
                    href={`tel:${RESTAURANT.phone.tel}`}
                    className="font-semibold underline decoration-saffron/40 underline-offset-2 hover:decoration-saffron"
                  >
                    {RESTAURANT.phone.display}
                  </a>{' '}
                  en indiquant votre référence.
                </span>
              </li>
            </ol>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-primary">
              Appeler le restaurant
            </a>
            <Link href="/menu" className="btn btn-ghost">
              Découvrir le buffet
            </Link>
            <Link href="/" className="btn btn-quiet">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
