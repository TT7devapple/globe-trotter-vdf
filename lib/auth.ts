import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

/**
 * Authentification de l'espace d'administration.
 *
 * Choix de conception : session JWT signée, stockée dans un cookie httpOnly.
 * Aucune dépendance à un fournisseur d'identité tiers — le site reste
 * déployable sur Netlify, Vercel, un VPS ou un conteneur Docker sans
 * modification. Voir README, section « Migration ».
 */

const COOKIE_NAME = 'gt_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 heures

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET manquant ou trop court (32 caractères minimum). ' +
        'Générez-en un avec : node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { sub: string; email: string; name?: string | null };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ email: payload.email, name: payload.name ?? null })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Session courante, ou null si absente / invalide / expirée. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ''),
      name: (payload.name as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Vérifie l'identifiant/mot de passe et met à jour la date de connexion. */
export async function authenticate(email: string, password: string): Promise<SessionPayload | null> {
  const user = await prisma.adminUser.findUnique({ where: { email } });

  // Comparaison systématique, même sans utilisateur : évite de révéler par le
  // temps de réponse qu'une adresse existe ou non.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const valid = await verifyPassword(password, hash);
  if (!user || !valid) return null;

  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { sub: user.id, email: user.email, name: user.name };
}

/** Garde de route : à appeler en tête de toute page ou API d'administration. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}
