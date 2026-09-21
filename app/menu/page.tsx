import type { Metadata } from 'next';
import Link from 'next/link';
import MenuExplorer from '@/components/MenuExplorer';
import WorldMap from '@/components/WorldMap';
import { Section, SectionHeader } from '@/components/Section';
import { ALLERGENS, universeCount } from '@/data/menu';
import { RESTAURANT } from '@/data/restaurant';

export const metadata: Metadata = {
  title: 'Le buffet — sushi, wok, grillades, pizza, fruits de mer',
  description:
    'Découvrez le buffet à volonté de Globe Trotter Val de Fontenay : sushi et maki, wok, grillades, ' +
    'pizza et pâtes, fruits de mer, desserts et glaces. Centre commercial Auchan Val de Fontenay, Fontenay-sous-Bois.',
  alternates: { canonical: '/menu' },
};

export default function MenuPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10 pb-16 pt-32 md:pb-20 md:pt-40">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(70% 60% at 80% 0%, rgba(124,92,255,0.16), transparent 65%),' +
              'radial-gradient(50% 50% at 10% 100%, rgba(255,122,69,0.1), transparent 70%)',
          }}
        />
        <div className="shell">
          <p className="eyebrow">Le buffet / {universeCount()} univers</p>
          <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
            Tout le buffet,
            <br />
            <span className="text-gradient-aurora">à volonté</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-titanium">
            Le buffet est servi à volonté : aucun plat n&rsquo;est facturé à l&rsquo;unité. Servez-vous
            librement dans chaque univers, autant de fois que vous le souhaitez, pendant tout le
            service.
          </p>
        </div>
      </header>

      <Section tone="dark" className="!pt-10">
        <div className="shell">
          <MenuExplorer />
        </div>
      </Section>

      <Section tone="deep" labelledBy="carte-menu-titre">
        <div className="shell">
          <SectionHeader
            eyebrow="Réseau"
            id="carte-menu-titre"
            align="center"
            title="Vos escales"
            lead="Chaque point correspond à un comptoir du buffet."
          />
          <div className="mt-12">
            <WorldMap />
          </div>
        </div>
      </Section>

      {/* Allergènes — obligation d'information */}
      <Section tone="dark" id="allergenes" labelledBy="allergenes-titre">
        <div className="shell">
          <SectionHeader
            eyebrow="Information"
            id="allergenes-titre"
            title="Allergènes"
            lead="Les mentions portées sur cette page sont indicatives. Un buffet est un espace partagé : des traces peuvent être présentes dans n’importe quelle préparation."
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <ul className="flex flex-wrap gap-2 self-start">
              {Object.values(ALLERGENS).map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 font-mono text-micro-sm uppercase text-steel"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="rounded-panel border border-saffron/25 bg-saffron/[0.05] p-6 md:p-8">
              <p className="font-mono text-micro-sm uppercase text-saffron">En cas d’allergie</p>
              <p className="mt-4 leading-relaxed text-saffron/90">
                Signalez votre allergie <strong className="font-semibold">avant votre venue</strong>,
                par téléphone, et de nouveau à votre arrivée. L&rsquo;équipe vous indiquera ce que
                vous pouvez consommer sans risque. Ne vous fiez pas uniquement à cette page : la
                composition du buffet évolue au fil des services.
              </p>
              <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-ghost mt-6">
                Appeler le {RESTAURANT.phone.display}
              </a>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 sm:flex-row">
            <Link href="/reserver" className="btn btn-primary">
              Réserver une table
            </Link>
            <Link href="/formules" className="btn btn-ghost">
              Voir les formules
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
