import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import WorldMap from '@/components/WorldMap';
import BuffetSection from '@/components/BuffetSection';
import DestinationCard from '@/components/DestinationCard';
import FormulaCard from '@/components/FormulaCard';
import Reviews from '@/components/Reviews';
import Gallery from '@/components/Gallery';
import Location from '@/components/Location';
import ImmersiveDish from '@/components/ImmersiveDish';
import Reveal from '@/components/Reveal';
import { Section, SectionHeader } from '@/components/Section';
import { MENU } from '@/data/menu';
import { FORMULAS } from '@/data/formulas';
import { RESTAURANT, SEO } from '@/data/restaurant';
import { FEATURES } from '@/data/verification';

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  // Les six premiers univers, hors boissons : la grille reste équilibrée
  // même si le restaurant modifie sa carte.
  const featured = MENU.filter((c) => c.id !== 'boissons').slice(0, 6);

  return (
    <>
      <Hero />

      {/* ——————— Un monde de saveurs ——————— */}
      <Section tone="dark" labelledBy="voyage-titre">
        <div className="shell">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Un monde de saveurs"
              id="voyage-titre"
              title={
                <>
                  Six escales,
                  <br />
                  <span className="text-gradient-aurora">un seul repas</span>
                </>
              }
              lead="Chaque comptoir du buffet est une destination. Vous passez de l’un à l’autre librement, autant de fois que vous le souhaitez."
            />
            <Link href="/menu" className="btn btn-ghost shrink-0">
              Tout le buffet
            </Link>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((category, index) => (
              /* Décalage par colonne plutôt que par carte : la cascade suit
                 le sens de lecture au lieu de faire attendre la dernière. */
              <Reveal as="li" key={category.id} delay={(index % 3) * 110}>
                <DestinationCard category={category} index={index} />
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* ——————— Escale immersive ——————— */}
      {/* Le premier univers signature occupe tout l'écran : c'est la
          respiration entre la grille des escales et la carte du monde. */}
      <ImmersiveDish categoryId="sushi" step={2} />

      {/* ——————— Carte du monde ——————— */}
      <Section tone="deep" labelledBy="carte-titre">
        <div className="shell">
          <SectionHeader
            eyebrow="Réseau"
            id="carte-titre"
            align="center"
            title="Le monde dans votre assiette"
            lead="Survolez une escale pour voir ce qui vous y attend. Chaque point correspond à un univers réellement présent au buffet."
          />
          <div className="mt-14">
            <WorldMap />
          </div>
        </div>
      </Section>

      {/* ——————— Le buffet ——————— */}
      <BuffetSection />

      {/* ——————— Formules ——————— */}
      <Section tone="dark" labelledBy="formules-titre" id="formules">
        <div className="shell">
          <SectionHeader
            eyebrow="Choisissez votre expérience"
            id="formules-titre"
            align="center"
            title="Les formules"
            lead={
              FEATURES.showPrices
                ? 'Un seul tarif, tout le buffet. Pas de supplément, pas de carte à part.'
                : 'Un seul tarif, tout le buffet. Les montants vous sont communiqués par téléphone — nous préférons vous donner le bon prix plutôt qu’un prix approximatif.'
            }
          />

          <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {FORMULAS.map((formula) => (
              <li key={formula.id} className="flex">
                <FormulaCard formula={formula} />
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-steel">
            Titres-restaurant acceptés (Edenred, Pluxee, Up Déjeuner, Bimpli). Établissement halal.
            Pour un repas de groupe ou une privatisation, appelez le{' '}
            <a href={`tel:${RESTAURANT.phone.tel}`} className="text-aurora underline underline-offset-2">
              {RESTAURANT.phone.display}
            </a>
            .
          </p>
        </div>
      </Section>

      {/* ——————— Galerie ——————— */}
      <Section tone="deep" labelledBy="galerie-titre">
        <div className="shell">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="En images"
              id="galerie-titre"
              title="L’atmosphère"
              lead="Une salle contemporaine au cœur du centre commercial, pensée pour les familles comme pour les grandes tablées."
            />
            <Link href="/galerie" className="btn btn-ghost shrink-0">
              Toute la galerie
            </Link>
          </div>
          <div className="mt-14">
            <Gallery limit={6} />
          </div>
        </div>
      </Section>

      {/* ——————— Avis ——————— */}
      <Reviews />

      {/* ——————— Accès ——————— */}
      <Location />
    </>
  );
}
