import type { Metadata } from 'next';
import Location from '@/components/Location';
import { Section, SectionHeader } from '@/components/Section';
import { RESTAURANT } from '@/data/restaurant';
import { ALLERGENS } from '@/data/menu';

export const metadata: Metadata = {
  title: 'Infos pratiques & accès',
  description:
    'Adresse, horaires, accès, services et informations pratiques de Globe Trotter Val de Fontenay, ' +
    'buffet à volonté au centre commercial Auchan Val de Fontenay, 94120 Fontenay-sous-Bois.',
  alternates: { canonical: '/infos' },
};

export default function InfosPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10 pb-16 pt-32 md:pb-20 md:pt-40">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(70% 60% at 40% 0%, rgba(61,224,255,0.13), transparent 65%)',
          }}
        />
        <div className="shell">
          <p className="eyebrow">Infos pratiques</p>
          <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
            Tout
            <br />
            <span className="text-gradient-aurora">savoir</span>
          </h1>
        </div>
      </header>

      <Location />

      {/* Services */}
      <Section tone="deep" id="services" labelledBy="services-titre">
        <div className="shell">
          <SectionHeader
            eyebrow="Services"
            id="services-titre"
            title="Sur place"
            lead="Les services indiqués ci-dessous proviennent de sources publiques concordantes."
          />

          <ul className="mt-12 grid gap-px overflow-hidden rounded-panel border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {RESTAURANT.services.map((service) => (
              <li key={service.id} className="bg-abyss p-6">
                <p className="font-display text-lg text-chrome">{service.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-steel">{service.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Allergènes */}
      <Section tone="dark" id="allergenes" labelledBy="allergenes-infos-titre">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeader
            eyebrow="Information"
            id="allergenes-infos-titre"
            title="Allergènes"
            lead="Le buffet est un espace partagé. Des traces d’allergènes peuvent être présentes dans n’importe quelle préparation, y compris celles qui n’en contiennent pas dans leur recette."
          />

          <div>
            <ul className="flex flex-wrap gap-2">
              {Object.values(ALLERGENS).map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 font-mono text-micro-sm uppercase text-steel"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-panel border border-saffron/25 bg-saffron/[0.05] p-6">
              <p className="leading-relaxed text-saffron/90">
                Si vous êtes allergique, prévenez-nous{' '}
                <strong className="font-semibold">avant votre venue</strong> et rappelez-le à votre
                arrivée. L&rsquo;équipe vous indiquera ce que vous pouvez consommer.
              </p>
              <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-ghost mt-5">
                {RESTAURANT.phone.display}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
