import type { Metadata } from 'next';
import { RESTAURANT } from '@/data/restaurant';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et politique de confidentialité du site Globe Trotter Val de Fontenay.',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: true },
};

/**
 * Mentions légales.
 *
 * Les champs entre crochets sont des EMPLACEMENTS À COMPLÉTER : raison
 * sociale, SIRET, hébergeur, directeur de publication. Ces informations ne
 * sont pas déductibles des sources publiques consultées et sont juridiquement
 * obligatoires — elles doivent être renseignées par le restaurant avant la
 * mise en ligne.
 */
export default function LegalPage() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-25" />

      <div className="shell max-w-3xl pb-24 pt-32 md:pt-40">
        <p className="eyebrow">Informations légales</p>
        <h1 className="mt-5 font-display text-display-md font-bold uppercase">Mentions légales</h1>

        <div className="mt-6 rounded-xl border border-saffron/25 bg-saffron/[0.05] px-5 py-4 text-sm leading-relaxed text-saffron/90">
          <strong className="font-semibold">À compléter avant mise en ligne.</strong> Les éléments
          entre crochets sont des obligations légales que seul le restaurant peut renseigner
          (raison sociale, SIRET, hébergeur, directeur de publication). Ils ne figurent dans aucune
          source publique et n&rsquo;ont donc pas été inventés.
        </div>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl uppercase text-chrome">Éditeur du site</h2>
            <div className="mt-4 space-y-1.5 leading-relaxed text-titanium">
              <p>{RESTAURANT.legalName}</p>
              <p>{RESTAURANT.address.venue}</p>
              <p>
                {RESTAURANT.address.street}
                <br />
                {RESTAURANT.address.postalCode} {RESTAURANT.address.city}
              </p>
              <p>Téléphone : {RESTAURANT.phone.display}</p>
              <p className="text-steel">Raison sociale : [à compléter]</p>
              <p className="text-steel">Forme juridique et capital social : [à compléter]</p>
              <p className="text-steel">SIRET : [à compléter]</p>
              <p className="text-steel">RCS : [à compléter]</p>
              <p className="text-steel">Numéro de TVA intracommunautaire : [à compléter]</p>
              <p className="text-steel">Directeur de la publication : [à compléter]</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase text-chrome">Hébergement</h2>
            <p className="mt-4 leading-relaxed text-steel">
              [Nom de l&rsquo;hébergeur, adresse et téléphone — à compléter selon
              l&rsquo;hébergeur retenu.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase text-chrome">Données personnelles</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-titanium">
              <p>
                Les informations recueillies via le formulaire de réservation (nom, prénom,
                téléphone, adresse e-mail, date, heure, nombre de convives et demande particulière)
                servent uniquement à traiter votre réservation et à vous recontacter à son sujet.
              </p>
              <p>
                Elles ne sont ni revendues, ni cédées, ni utilisées à des fins publicitaires. Elles
                sont conservées le temps nécessaire à la gestion du service, puis supprimées.
              </p>
              <p>
                Conformément au Règlement général sur la protection des données, vous disposez
                d&rsquo;un droit d&rsquo;accès, de rectification, d&rsquo;effacement, de limitation
                et d&rsquo;opposition sur vos données. Pour l&rsquo;exercer, contactez le restaurant
                au{' '}
                <a href={`tel:${RESTAURANT.phone.tel}`} className="text-aurora underline underline-offset-2">
                  {RESTAURANT.phone.display}
                </a>
                {RESTAURANT.email ? ` ou à l’adresse ${RESTAURANT.email}` : ''}.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase text-chrome">
              Cookies et mesure d&rsquo;audience
            </h2>
            <p className="mt-4 leading-relaxed text-titanium">
              Ce site ne dépose aucun cookie publicitaire et n&rsquo;utilise aucun outil de suivi
              tiers. Un cookie technique est utilisé uniquement pour maintenir la session de
              l&rsquo;espace d&rsquo;administration du restaurant. La carte de localisation est
              fournie par OpenStreetMap et n&rsquo;est chargée qu&rsquo;à l&rsquo;affichage de la
              section correspondante.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase text-chrome">Propriété intellectuelle</h2>
            <p className="mt-4 leading-relaxed text-titanium">
              L&rsquo;ensemble des éléments graphiques et textuels de ce site est protégé. Les
              compositions visuelles présentées dans la galerie sont des créations graphiques
              générées pour ce site et ne sont pas des photographies de l&rsquo;établissement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase text-chrome">
              Exactitude des informations
            </h2>
            <p className="mt-4 leading-relaxed text-titanium">
              Les horaires, la composition du buffet et les tarifs peuvent évoluer. Les informations
              publiées sur ce site sont données à titre indicatif : pour toute question déterminante
              (allergie, horaire, tarif, capacité), appelez le restaurant au{' '}
              <a href={`tel:${RESTAURANT.phone.tel}`} className="text-aurora underline underline-offset-2">
                {RESTAURANT.phone.display}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
