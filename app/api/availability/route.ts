import { NextResponse } from 'next/server';
import { availabilityForDate } from '@/lib/reservations';
import { CLOSED_DATES, OPEN_DAYS } from '@/data/openingHours';
import { parseDateOnly, todayInParis, daysBetween } from '@/lib/datetime';
import { RESTAURANT } from '@/data/restaurant';

/** Ces données dépendent de la base : jamais de mise en cache. */
export const dynamic = 'force-dynamic';

/**
 * GET /api/availability?date=YYYY-MM-DD&guests=2
 * Créneaux réservables pour une date et une taille de groupe.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? '';
  const guests = Number(searchParams.get('guests') ?? '1');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: 'Paramètre « date » invalide.' }, { status: 400 });
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > RESTAURANT.onlineCapacity.maxPartySizeOnline) {
    return NextResponse.json({ message: 'Paramètre « guests » invalide.' }, { status: 400 });
  }

  let day: Date;
  try {
    day = parseDateOnly(date);
  } catch {
    return NextResponse.json({ message: 'Date invalide.' }, { status: 400 });
  }

  const delta = daysBetween(todayInParis(), date);
  if (delta < 0 || delta > RESTAURANT.onlineCapacity.maxAdvanceDays) {
    return NextResponse.json({ services: [], closed: true, reason: 'Hors période de réservation.' });
  }

  if (CLOSED_DATES.includes(date) || !OPEN_DAYS.includes(day.getUTCDay())) {
    return NextResponse.json({ services: [], closed: true, reason: 'Le restaurant est fermé ce jour-là.' });
  }

  try {
    const services = await availabilityForDate(date, guests);
    return NextResponse.json({ services, closed: false });
  } catch (error) {
    console.error('[availability]', error);
    return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
  }
}
