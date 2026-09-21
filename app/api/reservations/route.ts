import { NextResponse } from 'next/server';
import { fieldErrors, reservationInputSchema } from '@/lib/validation';
import { ReservationError, createReservation } from '@/lib/reservations';
import { toDateOnly } from '@/lib/datetime';

export const dynamic = 'force-dynamic';

/**
 * Limitation de débit, en mémoire du processus.
 *
 * Suffisant pour un site de restaurant sur une instance unique : cela stoppe
 * un script qui tenterait de saturer le carnet. Sur plusieurs instances, ou
 * en environnement sans état, remplacez par un compteur partagé (Redis,
 * Upstash) — c'est le seul endroit du code à modifier.
 */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };
const attempts = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);

  // Purge occasionnelle, pour éviter que la table ne grossisse indéfiniment.
  if (attempts.size > 5000) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) attempts.delete(k);
    }
  }
  return false;
}

/** POST /api/reservations — enregistre une demande de réservation. */
export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'inconnu';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: 'Trop de demandes depuis cette connexion. Réessayez plus tard ou appelez-nous.' },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 });
  }

  const parsed = reservationInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Merci de corriger les champs signalés.', errors: fieldErrors(parsed.error) },
      { status: 422 }
    );
  }

  try {
    const reservation = await createReservation(parsed.data);

    return NextResponse.json(
      {
        reservation: {
          reference: reservation.reference,
          date: toDateOnly(reservation.date),
          time: reservation.time,
          guests: reservation.guests,
          firstName: reservation.firstName,
          status: reservation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ReservationError) {
      return NextResponse.json(
        { message: error.message, errors: { [error.field]: error.message } },
        { status: error.code === 'DUPLICATE' ? 409 : 422 }
      );
    }
    console.error('[reservations]', error);
    return NextResponse.json({ message: 'Erreur serveur. Merci de réessayer.' }, { status: 500 });
  }
}
