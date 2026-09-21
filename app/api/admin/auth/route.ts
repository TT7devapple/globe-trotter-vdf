import { NextResponse } from 'next/server';
import { authenticate, createSession, destroySession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * Limitation des tentatives de connexion.
 * Protège contre un essai systématique de mots de passe. Comme pour les
 * réservations, le compteur vit dans le processus : pour un déploiement
 * multi-instances, remplacez par un compteur partagé.
 */
const LOGIN_LIMIT = { windowMs: 15 * 60 * 1000, max: 8 };
const loginAttempts = new Map<string, number[]>();

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const recent = (loginAttempts.get(key) ?? []).filter((t) => now - t < LOGIN_LIMIT.windowMs);
  recent.push(now);
  loginAttempts.set(key, recent);
  return recent.length > LOGIN_LIMIT.max;
}

/** POST /api/admin/auth — connexion. */
export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'inconnu';

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Identifiants invalides.' }, { status: 400 });
  }

  try {
    const session = await authenticate(parsed.data.email, parsed.data.password);
    if (!session) {
      // Message volontairement identique que l'adresse existe ou non.
      return NextResponse.json({ message: 'Identifiants incorrects.' }, { status: 401 });
    }

    await createSession(session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin-auth]', error);
    return NextResponse.json(
      { message: 'Erreur serveur. Vérifiez la configuration (AUTH_SECRET, base de données).' },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/auth — déconnexion. */
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
