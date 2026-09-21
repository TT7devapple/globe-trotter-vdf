'use client';

import { useEffect, useState } from 'react';
import { currentStatus } from '@/data/openingHours';

/**
 * Pastille « Ouvert / Fermé » en temps réel.
 *
 * Le calcul est fait côté client uniquement : rendu sur le serveur, il
 * afficherait l'heure du serveur et provoquerait une incohérence
 * d'hydratation. Avant le montage, on n'affiche rien plutôt qu'une
 * information potentiellement fausse.
 */
export default function OpenStatus({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof currentStatus> | null>(null);

  useEffect(() => {
    const update = () => setStatus(currentStatus());
    update();
    // Rafraîchi chaque minute : suffisant pour un basculement à l'heure pile.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!status) {
    return <span className={`h-[26px] ${className}`} aria-hidden="true" />;
  }

  return (
    <span
      className={`chip ${
        status.open ? 'border-jade/30 bg-jade/[0.08] text-jade' : 'border-white/10 bg-white/[0.03] text-steel'
      } ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {status.open && (
          <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-jade" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            status.open ? 'bg-jade' : 'bg-steel'
          }`}
        />
      </span>
      {status.label}
      <span className="text-steel/70 normal-case tracking-normal">· {status.detail}</span>
    </span>
  );
}
