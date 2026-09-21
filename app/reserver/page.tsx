import type { Metadata } from 'next';
import ReservationForm from '@/components/ReservationForm';
import OpeningHours from '@/components/OpeningHours';
import { RESTAURANT } from '@/data/restaurant';

export const metadata: Metadata = {
  title: 'Réserver une table',
  description:
    'Réservez votre table au buffet à volonté Globe Trotter Val de Fontenay. ' +
    'Centre commercial Auchan Val de Fontenay, 94120 Fontenay-sous-Bois. Ouvert 7j/7, midi et soir.',
  alternates: { canonical: '/reserver' },
  robots: { index: true, follow: true },
};

export default function ReservationPage() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-30" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[60vh]"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(61,224,255,0.12), transparent 70%),' +
            'radial-gradient(40% 40% at 85% 20%, rgba(255,122,69,0.1), transparent 70%)',
        }}
      />

      <div className="shell pb-24 pt-32 md:pt-40">
        <header className="max-w-2xl">
          <p className="eyebrow">Réservation</p>
          <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
            Réservez
            <br />
            <span className="text-gradient-aurora">votre table</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-titanium">
            Trois étapes, une minute. Votre demande est transmise au restaurant, qui la valide et
            vous recontacte.
          </p>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="rounded-panel border border-white/10 bg-hull p-6 md:p-10">
            <ReservationForm />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-panel border border-white/10 bg-hull p-6">
              <OpeningHours compact />
            </div>

            <div className="rounded-panel border border-white/10 bg-hull p-6">
              <p className="eyebrow">Préférez appeler ?</p>
              <a
                href={`tel:${RESTAURANT.phone.tel}`}
                className="mt-3 block font-display text-3xl text-aurora underline decoration-aurora/25 underline-offset-4 transition-colors hover:decoration-aurora"
              >
                {RESTAURANT.phone.display}
              </a>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Pour un groupe, une privatisation, une allergie ou une demande urgente, le téléphone
                reste le plus rapide.
              </p>
            </div>

            <div id="groupes" className="scroll-mt-28 rounded-panel border border-white/10 bg-hull p-6">
              <p className="eyebrow">Groupes & événements</p>
              <p className="mt-3 leading-relaxed text-titanium">
                Au-delà de {RESTAURANT.onlineCapacity.maxPartySizeOnline} personnes, la réservation
                se fait par téléphone. Une salle privative est disponible pour les anniversaires et
                les repas d&rsquo;entreprise.
              </p>
              <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-ghost mt-5 w-full">
                Organiser un repas de groupe
              </a>
            </div>

            <div className="rounded-panel border border-white/10 bg-hull p-6">
              <p className="eyebrow">Adresse</p>
              <address className="mt-3 not-italic leading-relaxed text-titanium">
                {RESTAURANT.address.venue}
                <br />
                {RESTAURANT.address.street}
                <br />
                {RESTAURANT.address.postalCode} {RESTAURANT.address.city}
              </address>
              <a
                href={RESTAURANT.links.directions}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-5 w-full"
              >
                Itinéraire
                <span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            </div>

            <p className="px-2 text-[12px] leading-relaxed text-steel">
              Vos données ne servent qu&rsquo;à traiter votre réservation. Elles ne sont ni
              revendues, ni utilisées à des fins publicitaires. Voir les{' '}
              <a href="/mentions-legales" className="underline underline-offset-2 hover:text-titanium">
                mentions légales
              </a>
              .
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
