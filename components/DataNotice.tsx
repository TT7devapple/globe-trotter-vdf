'use client';

import { useEffect, useState } from 'react';
import { FEATURES, pendingVerifications } from '@/data/verification';

/**
 * Bandeau de recette.
 *
 * Il rappelle au restaurant, avant mise en ligne publique, quelles
 * informations restent à confirmer. Il n'est PAS destiné aux visiteurs :
 * passez FEATURES.showDataBanner à false dans data/verification.ts au moment
 * de la mise en production.
 */
export default function DataNotice() {
  const [dismissed, setDismissed] = useState(true);
  const pending = pendingVerifications();

  useEffect(() => {
    if (!FEATURES.showDataBanner || pending.length === 0) return;
    try {
      setDismissed(sessionStorage.getItem('gt-data-notice') === 'hidden');
    } catch {
      // Navigation privée ou stockage bloqué : on affiche le bandeau.
      setDismissed(false);
    }
  }, [pending.length]);

  if (!FEATURES.showDataBanner || pending.length === 0 || dismissed) return null;

  const hide = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('gt-data-notice', 'hidden');
    } catch {
      // Sans stockage, le bandeau réapparaîtra : acceptable.
    }
  };

  return (
    /*
      Bandeau ancré EN BAS de la fenêtre, et non en haut.
      En haut, il recouvrait la barre de navigation, elle-même en position
      fixe : les deux se disputaient le même espace. En bas, il ne gêne
      aucun élément d'interface et reste tout aussi visible pendant la
      recette.
    */
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-saffron/25 bg-void/92 backdrop-blur-md"
    >
      <div className="shell flex items-start gap-3 py-2.5 text-left">
        <span aria-hidden="true" className="mt-0.5 text-saffron">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.2a.8.8 0 0 0-.8.8v2.6a.8.8 0 0 0 1.6 0V6.5a.8.8 0 0 0-.8-.8Zm0 5.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
          </svg>
        </span>
        <p className="flex-1 text-[13px] leading-relaxed text-saffron/90">
          <strong className="font-semibold">Version de recette.</strong>{' '}
          {pending.length} information{pending.length > 1 ? 's' : ''} à confirmer
          {/* Sur un écran étroit, le texte long recouvrait les boutons du hero. */}
          <span className="hidden sm:inline">
            {' '}
            par le restaurant (horaires, tarifs, note Google, réseaux sociaux). Elles sont
            volontairement masquées ou signalées, jamais inventées. Détail dans{' '}
            <code className="rounded bg-saffron/15 px-1 py-0.5 font-mono text-[11px]">
              data/verification.ts
            </code>
          </span>
          .
        </p>
        <button
          type="button"
          onClick={hide}
          className="shrink-0 rounded-full p-1.5 text-saffron/70 transition-colors hover:bg-saffron/10 hover:text-saffron"
          aria-label="Masquer cet avertissement pour cette session"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
