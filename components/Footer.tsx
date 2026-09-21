import Link from 'next/link';
import { RESTAURANT } from '@/data/restaurant';
import { FEATURES } from '@/data/verification';
import { SERVICES } from '@/data/openingHours';
import Wordmark from './Wordmark';
import { formatCoordinates } from '@/lib/worldmap';

const COLUMNS = [
  {
    title: 'Le restaurant',
    links: [
      { href: '/menu', label: 'Le buffet' },
      { href: '/formules', label: 'Formules' },
      { href: '/galerie', label: 'Galerie' },
      { href: '/infos', label: 'Infos & accès' },
    ],
  },
  {
    title: 'Réserver',
    links: [
      { href: '/reserver', label: 'Réserver une table' },
      { href: '/reserver#groupes', label: 'Groupes & événements' },
      { href: '/infos#services', label: 'Services' },
      { href: '/infos#allergenes', label: 'Allergènes' },
    ],
  },
];

export default function Footer() {
  const social = Object.entries(RESTAURANT.social).filter(([, value]) => value) as [string, string][];
  const showSocial = FEATURES.showSocialLinks && social.length > 0;

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-abyss">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

      {/* Rappel d'action */}
      <div className="relative border-b border-white/10">
        <div className="shell flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <p className="font-display text-display-sm font-semibold uppercase text-chrome">
            Votre table vous attend
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/reserver" className="btn btn-primary">
              Réserver
            </Link>
            <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-ghost">
              {RESTAURANT.phone.display}
            </a>
          </div>
        </div>
      </div>

      <div className="shell relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Identité */}
        <div className="lg:col-span-1">
          <Wordmark className="h-9 w-auto" />
          <address className="mt-6 not-italic text-sm leading-relaxed text-steel">
            {RESTAURANT.address.venue}
            <br />
            {RESTAURANT.address.street}
            <br />
            {RESTAURANT.address.postalCode} {RESTAURANT.address.city}
          </address>
          <p
            aria-hidden="true"
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45"
          >
            {formatCoordinates(RESTAURANT.geo.lat, RESTAURANT.geo.lng)}
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="eyebrow">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-titanium transition-colors hover:text-chrome"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Horaires + contact */}
        <div>
          <h2 className="eyebrow">Horaires</h2>
          <ul className="mt-5 space-y-2">
            {SERVICES.map((service) => (
              <li key={service.id} className="text-sm text-titanium">
                <span className="block font-mono text-micro-sm uppercase text-steel">
                  {service.label}
                </span>
                <span className="tabular-nums text-chrome">
                  {service.opens.replace(':', 'h')} — {service.closes.replace(':', 'h')}
                </span>
              </li>
            ))}
          </ul>

          {showSocial && (
            <div className="mt-6">
              <h2 className="eyebrow">Nous suivre</h2>
              <ul className="mt-3 flex gap-2">
                {social.map(([network, url]) => (
                  <li key={network}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 font-mono text-[10px] uppercase text-steel transition-colors hover:border-aurora/40 hover:text-chrome"
                    >
                      <span className="sr-only">{network} (nouvelle fenêtre)</span>
                      <span aria-hidden="true">{network.slice(0, 2)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mentions */}
      <div className="relative border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-[12px] text-steel md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {RESTAURANT.legalName}. Tous droits réservés.
          </p>
          <nav aria-label="Liens légaux">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <Link href="/mentions-legales" className="transition-colors hover:text-titanium">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/infos#allergenes" className="transition-colors hover:text-titanium">
                  Allergènes
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-titanium">
                  Administration
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
