import type { Metadata } from 'next';
import Link from 'next/link';
import FormulaCard from '@/components/FormulaCard';
import OpeningHours from '@/components/OpeningHours';
import { Section, SectionHeader } from '@/components/Section';
import { FORMULAS } from '@/data/formulas';
import { FEATURES } from '@/data/verification';
import { RESTAURANT } from '@/data/restaurant';

export const metadata: Metadata = {
  title: 'Formules & tarifs du buffet à volonté',
  description:
    'Les formules du buffet à volonté Globe Trotter Val de Fontenay : midi, soir, week-end et enfant. ' +
    'Centre commercial Auchan Val de Fontenay, Fontenay-sous-Bois. Réservation en ligne.',
  alternates: { canonical: '/formules' },
};

export default function FormulasPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10 pb-16 pt-32 md:pb-20 md:pt-40">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(70% 60% at 20% 0%, rgba(255,122,69,0.14), transparent 65%)',
          }}
        />
        <div className="shell">
          <p className="eyebrow">Choisissez votre expérience</p>
          <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
            Les
            <br />
            <span className="text-gradient-aurora">formules</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-titanium">
            Un seul tarif par personne, tout le buffet compris. Pas de supplément par plat, pas de
            carte à part : vous payez l&rsquo;accès, vous mangez ce que vous voulez.
          </p>
        </div>
      </header>

      <Section tone="dark">
        <div className="shell">
          {!FEATURES.showPrices && (
            <div className="mb-12 rounded-panel border border-saffron/25 bg-saffron/[0.05] p-6 md:p-8">
              <p className="font-mono text-micro-sm uppercase text-saffron">
                Pourquoi les tarifs ne sont pas affichés ici
              </p>
              <p className="mt-4 max-w-3xl leading-relaxed text-saffron/90">
                Les montants qui circulent en ligne pour Globe Trotter Val de Fontenay ne concordent
                pas entre eux, et certains proviennent en réalité d&rsquo;autres établissements
                Globe Trotter. Plutôt que d&rsquo;afficher un prix qui risquerait d&rsquo;être faux
                à votre arrivée, nous vous invitons à nous appeler : vous aurez le tarif exact du
                jour, en quelques secondes.
              </p>
              <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-primary mt-6">
                Appeler le {RESTAURANT.phone.display}
              </a>
            </div>
          )}

          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {FORMULAS.map((formula) => (
              <li key={formula.id} className="flex">
                <FormulaCard formula={formula} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="deep" labelledBy="pratique-titre">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Pratique"
              id="pratique-titre"
              title="Bon à savoir"
              lead="Quelques points qui reviennent souvent avant une première visite."
            />

            <dl className="mt-10 divide-y divide-white/5 border-y border-white/10">
              {[
                {
                  q: 'Le buffet est-il vraiment à volonté ?',
                  a: 'Oui. Vous vous servez autant de fois que vous le souhaitez, dans tous les univers ouverts, pendant toute la durée du service.',
                },
                {
                  q: 'Les boissons sont-elles comprises ?',
                  a: 'Plusieurs sources indiquent les boissons incluses le soir et le week-end, mais nous n’avons pas pu le confirmer formellement. Demandez-le à la réservation.',
                },
                {
                  q: 'Acceptez-vous les titres-restaurant ?',
                  a: 'Edenred, Pluxee, Up Déjeuner et Bimpli sont indiqués comme acceptés.',
                },
                {
                  q: 'La cuisine est-elle halal ?',
                  a: 'L’établissement est indiqué comme halal par plusieurs sources concordantes.',
                },
                {
                  q: 'Venir en groupe, est-ce possible ?',
                  a: 'Oui, et une salle privative est mentionnée. Pour un groupe, appelez directement le restaurant plutôt que de réserver en ligne.',
                },
                {
                  q: 'Y a-t-il des options végétariennes ?',
                  a: 'Oui : salades, crudités, légumes au wok, pâtes, fruits et desserts. Le filtre « végétarien » de la page du buffet les rassemble.',
                },
              ].map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-display text-lg text-chrome">{item.q}</dt>
                  <dd className="mt-2 leading-relaxed text-steel">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-8 lg:pt-20">
            <div className="rounded-panel border border-white/10 bg-hull p-6 md:p-8">
              <OpeningHours />
            </div>

            <div className="rounded-panel border border-white/10 bg-hull p-6 md:p-8">
              <p className="eyebrow">Prêt à partir ?</p>
              <p className="mt-4 font-display text-2xl leading-tight text-chrome">
                Réservez votre table en moins d&rsquo;une minute.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/reserver" className="btn btn-primary">
                  Réserver
                </Link>
                <Link href="/menu" className="btn btn-ghost">
                  Voir le buffet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
