import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80svh] items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(60% 50% at 50% 30%, rgba(124,92,255,0.14), transparent 70%)',
        }}
      />

      <div className="shell py-24">
        <p className="eyebrow">Erreur 404 / Destination inconnue</p>
        <h1 className="mt-5 font-display text-display-lg font-bold uppercase">
          Cette escale
          <br />
          <span className="text-gradient-aurora">n&rsquo;existe pas</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-titanium">
          La page que vous cherchez a changé d&rsquo;adresse, ou n&rsquo;a jamais existé. Le buffet,
          lui, est toujours là.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Retour à l&rsquo;accueil
          </Link>
          <Link href="/menu" className="btn btn-ghost">
            Découvrir le buffet
          </Link>
          <Link href="/reserver" className="btn btn-ghost">
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}
