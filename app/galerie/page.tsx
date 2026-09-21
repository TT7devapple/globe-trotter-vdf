import type { Metadata } from 'next';
import Link from 'next/link';
import Gallery from '@/components/Gallery';
import { Section } from '@/components/Section';

export const metadata: Metadata = {
  title: 'Galerie',
  description:
    'Le buffet, la salle et les univers culinaires de Globe Trotter Val de Fontenay, ' +
    'buffet à volonté au centre commercial Auchan Val de Fontenay, Fontenay-sous-Bois.',
  alternates: { canonical: '/galerie' },
};

export default function GalleryPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10 pb-16 pt-32 md:pb-20 md:pt-40">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(70% 60% at 60% 0%, rgba(124,92,255,0.15), transparent 65%)',
          }}
        />
        <div className="shell">
          <p className="eyebrow">En images</p>
          <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
            La
            <br />
            <span className="text-gradient-aurora">galerie</span>
          </h1>
        </div>
      </header>

      <Section tone="dark">
        <div className="shell">
          <Gallery />

          <div className="mt-14 flex flex-col gap-3 sm:flex-row">
            <Link href="/reserver" className="btn btn-primary">
              Réserver une table
            </Link>
            <Link href="/menu" className="btn btn-ghost">
              Découvrir le buffet
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
