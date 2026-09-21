import Link from 'next/link';
import { RESTAURANT } from '@/data/restaurant';
import { formatCoordinates } from '@/lib/worldmap';
import { Section, SectionHeader } from './Section';
import OpeningHours from './OpeningHours';

/**
 * Section « Ready to travel ? » — accès, adresse, horaires.
 *
 * La carte est une carte OpenStreetMap chargée en iframe paresseuse : pas de
 * clé d'API, pas de facturation, pas de traceur tiers chargé au premier
 * rendu. Le lien d'itinéraire, lui, pointe vers Google Maps, que la plupart
 * des visiteurs utilisent déjà.
 */
export default function Location() {
  const { address, geo, phone, links } = RESTAURANT;
  const bbox = [geo.lng - 0.012, geo.lat - 0.006, geo.lng + 0.012, geo.lat + 0.006].join('%2C');

  return (
    <Section id="acces" labelledBy="acces-titre">
      <div className="shell">
        <SectionHeader
          eyebrow="Ready to travel ?"
          id="acces-titre"
          title={
            <>
              Au cœur de
              <br />
              <span className="text-gradient-aurora">Val de Fontenay</span>
            </>
          }
          lead="Le départ se fait au centre commercial Auchan Val de Fontenay. Parking sur place, accès direct depuis la galerie."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Carte */}
          <div className="relative overflow-hidden rounded-panel border border-white/10 bg-abyss">
            <iframe
              title="Carte de localisation de Globe Trotter Val de Fontenay"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[340px] w-full grayscale-[0.4] contrast-[1.1] md:h-[460px]"
              style={{ border: 0, colorScheme: 'light' }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
            />

            {/* Annotation de coordonnées */}
            <div
              aria-hidden="true"
              className="glass pointer-events-none absolute left-4 top-4 rounded-xl px-3.5 py-2"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aurora">
                {RESTAURANT.terminalCode}
              </p>
              <p className="font-mono text-[10px] tracking-wider text-steel">
                {formatCoordinates(geo.lat, geo.lng)}
              </p>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-8">
            <div>
              <p className="eyebrow">Adresse</p>
              <address className="mt-4 not-italic">
                <p className="font-display text-2xl leading-tight text-chrome">
                  {RESTAURANT.legalName}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-titanium">
                  {address.venue}
                  <br />
                  {address.street}
                  <br />
                  <span className="text-chrome">
                    {address.postalCode} {address.city}
                  </span>
                </p>
                <a
                  href={`tel:${phone.tel}`}
                  className="mt-4 inline-block font-display text-2xl text-aurora underline decoration-aurora/25 underline-offset-4 transition-colors hover:decoration-aurora"
                >
                  {phone.display}
                </a>
              </address>
            </div>

            <div className="hairline" />

            <OpeningHours compact />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={links.directions}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost flex-1"
              >
                Itinéraire
                <span className="sr-only"> (ouvre Google Maps dans une nouvelle fenêtre)</span>
              </a>
              <a href={`tel:${phone.tel}`} className="btn btn-ghost flex-1">
                Appeler
              </a>
              <Link href="/reserver" className="btn btn-primary flex-1">
                Réserver
              </Link>
            </div>

            <a
              href={links.mall}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors hover:border-aurora/30 hover:bg-aurora/[0.04]"
            >
              <span>
                <span className="block font-mono text-micro-sm uppercase text-steel">
                  Centre commercial
                </span>
                <span className="mt-1 block text-sm text-chrome">
                  Voir la fiche Aushopping Val de Fontenay
                </span>
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-steel transition-transform duration-300 group-hover:translate-x-1 group-hover:text-aurora"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="sr-only">(nouvelle fenêtre)</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
