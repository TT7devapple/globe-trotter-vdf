import { RESTAURANT } from '@/data/restaurant';

/**
 * Signature de marque.
 * Le globe est réduit à trois traits : un cercle, un équateur et un méridien
 * incliné — assez pour lire « planète » à 24 pixels de haut, assez sobre pour
 * ne pas concurrencer le nom. Le point cyan marque Val de Fontenay.
 */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-full w-auto shrink-0 text-aurora"
        fill="none"
      >
        <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
        <ellipse cx="16" cy="16" rx="5.2" ry="12.5" stroke="currentColor" strokeWidth="1.1" opacity="0.4" />
        <path d="M3.5 16h25" stroke="currentColor" strokeWidth="1.1" opacity="0.4" />
        <path d="M5.6 9.8h20.8M5.6 22.2h20.8" stroke="currentColor" strokeWidth="0.9" opacity="0.22" />
        <circle cx="19.4" cy="11.6" r="2.4" fill="currentColor" opacity="0.18" />
        <circle cx="19.4" cy="11.6" r="1.25" fill="currentColor" />
      </svg>

      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[0.95em] font-bold uppercase tracking-[0.16em] text-chrome">
          {RESTAURANT.name}
        </span>
        <span className="mt-1 font-mono text-[0.42em] uppercase tracking-[0.3em] text-steel">
          {RESTAURANT.location}
        </span>
      </span>
    </span>
  );
}
