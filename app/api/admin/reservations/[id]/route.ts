import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { adminEditSchema, fieldErrors } from '@/lib/validation';
import { parseDateOnly, toDateOnly } from '@/lib/datetime';
import { serviceForTime } from '@/data/openingHours';

export const dynamic = 'force-dynamic';

/** Toute route d'administration commence par cette vérification. */
async function guard() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }
  return null;
}

/** PATCH /api/admin/reservations/[id] — modifie une réservation. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 });
  }

  const parsed = adminEditSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Données invalides.', errors: fieldErrors(parsed.error) },
      { status: 422 }
    );
  }

  const { date, time, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };

  if (date) data.date = parseDateOnly(date);
  if (time) {
    data.time = time;
    // Le service doit toujours rester cohérent avec l'heure : sans cela,
    // les compteurs de capacité par service deviendraient faux.
    const service = serviceForTime(time);
    if (!service) {
      return NextResponse.json(
        { message: 'Cette heure ne correspond à aucun service.', errors: { time: 'Heure hors service.' } },
        { status: 422 }
      );
    }
    data.service = service;
  }

  try {
    const reservation = await prisma.reservation.update({ where: { id }, data });
    return NextResponse.json({
      reservation: { ...reservation, date: toDateOnly(reservation.date) },
    });
  } catch (error) {
    console.error('[admin-reservation-patch]', error);
    return NextResponse.json({ message: 'Réservation introuvable.' }, { status: 404 });
  }
}

/** DELETE /api/admin/reservations/[id] — supprime définitivement. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin-reservation-delete]', error);
    return NextResponse.json({ message: 'Réservation introuvable.' }, { status: 404 });
  }
}
