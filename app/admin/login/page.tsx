import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';
import Wordmark from '@/components/Wordmark';

export const metadata: Metadata = {
  title: 'Connexion — Administration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/admin');

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(55% 45% at 50% 30%, rgba(61,224,255,0.12), transparent 70%)',
        }}
      />

      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Wordmark className="h-9 w-auto" />
        </div>

        <div className="mt-10 rounded-panel border border-white/10 bg-hull p-8">
          <p className="eyebrow">Administration</p>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase">Connexion</h1>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            Espace réservé au restaurant. Les réservations et le contenu du site se gèrent depuis
            cet écran.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-steel">
          Identifiants oubliés ? Régénérez un mot de passe avec{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
            npm run admin:hash
          </code>
          , puis mettez à jour la variable{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">ADMIN_PASSWORD</code>{' '}
          et relancez{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">npm run db:seed</code>.
        </p>
      </div>
    </div>
  );
}
