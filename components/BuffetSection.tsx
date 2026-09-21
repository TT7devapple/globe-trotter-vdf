import Link from 'next/link';
import { MENU, universeCount } from '@/data/menu';
import { FEATURES } from '@/data/verification';
import { BUFFET_IMAGE } from '@/data/images';
import { RESTAURANT } from '@/data/restaurant';
import { Section, SectionHeader } from './Section';
import Visual from './Visual';

/**
 * Section « Le buffet ».
 *
 * Sur les statistiques : le nombre d'univers culinaires est COMPTÉ à partir
 * de data/menu.ts, ce n'est pas une estimation — il reste donc juste si le
 * restaurant modifie la carte. En revanche le nombre de plats (« plus de
 * 150 » selon plusieurs agrégateurs) n'est pas confirmé : il n'est affiché
 * que si FEATURES.showNumericStats est activé. À défaut, on s'en tient à des
 * formulations qualitatives, qui ne promettent rien de faux.
 */
export default function BuffetSection() {
  const universes = universeCount();

  return (
    <Section tone="deep" labelledBy="buffet-titre" id="buffet">
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visuel */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-white/10">
              {BUFFET_IMAGE ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={BUFFET_IMAGE}
                  alt="Le buffet de Globe Trotter Val de Fontenay"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <Visual id="buffet-principal" accent="ember" className="h-full w-full" />
              )}

              {/* Annotation flottante */}
              <div className="glass absolute bottom-4 left-4 right-4 rounded-2xl px-5 py-4 md:right-auto md:max-w-xs">
                <p className="font-mono text-micro-sm uppercase text-aurora">À volonté</p>
                <p className="mt-1.5 text-sm leading-relaxed text-titanium">
                  Servez-vous autant de fois que vous le souhaitez, dans tous les univers, du
                  premier au dernier service.
                </p>
              </div>
            </div>

            {/* Carte secondaire flottante */}
            <div className="glass absolute -right-3 -top-6 hidden rounded-2xl px-4 py-3 md:block lg:-right-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Certifié</p>
              <p className="font-display text-lg text-chrome">Halal</p>
            </div>
          </div>

          {/* Texte */}
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="Le buffet"
              id="buffet-titre"
              title={
                <>
                  Tout est <span className="text-gradient-aurora">ouvert</span>,
                  <br />
                  tout est à volonté
                </>
              }
              lead={
                <>
                  Pas de carte à éplucher, pas de choix à trancher. {universes} univers culinaires
                  restent ouverts pendant tout le service : vous composez votre repas au fil de vos
                  envies, et vous y revenez autant de fois que vous voulez.
                </>
              }
            />

            {/* Statistiques */}
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3">
              <Stat
                value={String(universes)}
                label="Univers culinaires"
                note="Comptés sur notre carte"
              />
              <Stat value="7/7" label="Jours d’ouverture" note="Midi et soir" />
              {FEATURES.showNumericStats ? (
                <Stat value="150+" label="Plats au buffet" note="Selon l’enseigne" />
              ) : (
                <Stat
                  value="∞"
                  label="Fois que vous voulez"
                  note="Buffet à volonté"
                  srHint="Sans limite"
                />
              )}
            </dl>

            <ul className="mt-8 flex flex-wrap gap-2">
              {MENU.filter((c) => c.id !== 'boissons').map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/menu#${category.id}`}
                    className="inline-flex rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2
                               font-mono text-micro-sm uppercase text-steel transition-all
                               hover:border-aurora/40 hover:bg-aurora/[0.06] hover:text-chrome"
                  >
                    {category.short}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="btn btn-ghost">
                Explorer le buffet
              </Link>
              <a href={`tel:${RESTAURANT.phone.tel}`} className="btn btn-quiet">
                Une question ? {RESTAURANT.phone.display}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Stat({
  value,
  label,
  note,
  srHint,
}: {
  value: string;
  label: string;
  note: string;
  srHint?: string;
}) {
  return (
    <div className="bg-abyss p-5">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-4xl font-bold tabular-nums text-chrome">
          <span aria-hidden={srHint ? 'true' : undefined}>{value}</span>
          {srHint && <span className="sr-only">{srHint}</span>}
        </span>
        <span className="mt-2 block font-mono text-micro-sm uppercase text-titanium">{label}</span>
        <span className="mt-1 block text-[11px] text-steel">{note}</span>
      </dd>
    </div>
  );
}
