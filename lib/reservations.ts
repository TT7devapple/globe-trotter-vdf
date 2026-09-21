import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { RESTAURANT } from '@/data/restaurant';
import { SERVICES, type ServiceId, serviceForTime, slotsForService } from '@/data/openingHours';
import { parseDateOnly, toDateOnly } from './datetime';
import type { ReservationInput } from './validation';

/**
 * Logique métier des réservations : disponibilités, anti-surréservation,
 * anti-doublon.
 *
 * Principe : le site ne connaît pas la capacité réelle du restaurant (donnée
 * non publique). Il applique donc un PLAFOND DE SÉCURITÉ de couverts
 * réservables en ligne par service (RESTAURANT.onlineCapacity), ajustable
 * date par date depuis l'administration via le modèle CapacityOverride.
 * Au-delà, le créneau est affiché comme complet et le visiteur est invité à
 * téléphoner — le restaurant garde la main.
 */

/** Les statuts qui consomment des couverts. Une annulation libère la place. */
const OCCUPYING_STATUSES = ['EN_ATTENTE', 'CONFIRMEE'];

export type SlotAvailability = {
  time: string;
  available: boolean;
  /** Couverts restants ; utile pour l'admin, masqué côté public. */
  remaining: number;
};

export type ServiceAvailability = {
  service: ServiceId;
  label: string;
  /** null si le service est entièrement fermé ce jour-là */
  closedReason: string | null;
  slots: SlotAvailability[];
};

/** Génère une référence lisible, ex. « GT-7F3K2A ». */
export function generateReference(): string {
  // Alphabet sans I, O, 0, 1 : évite les confusions à la lecture au téléphone.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `GT-${out}`;
}

/** Capacité réservable en ligne pour une date et un service donnés. */
export async function capacityFor(dateIso: string, service: ServiceId): Promise<{ seats: number; reason: string | null }> {
  const override = await prisma.capacityOverride.findUnique({
    where: { date_service: { date: parseDateOnly(dateIso), service } },
  });
  if (override) {
    return {
      seats: override.seats,
      reason: override.seats === 0 ? override.reason ?? 'Fermé à la réservation en ligne' : null,
    };
  }
  return { seats: RESTAURANT.onlineCapacity.defaultSeatsPerService, reason: null };
}

/** Couverts déjà engagés pour une date et un service. */
export async function bookedSeats(dateIso: string, service: ServiceId): Promise<number> {
  const result = await prisma.reservation.aggregate({
    where: { date: parseDateOnly(dateIso), service, status: { in: OCCUPYING_STATUSES } },
    _sum: { guests: true },
  });
  return result._sum.guests ?? 0;
}

/**
 * Disponibilités d'une journée, tous services confondus.
 * `partySize` permet de masquer les créneaux qui ne peuvent pas accueillir
 * le groupe demandé.
 */
export async function availabilityForDate(dateIso: string, partySize = 1): Promise<ServiceAvailability[]> {
  const out: ServiceAvailability[] = [];

  for (const service of SERVICES) {
    const { seats, reason } = await capacityFor(dateIso, service.id);
    const used = await bookedSeats(dateIso, service.id);
    const remaining = Math.max(0, seats - used);

    out.push({
      service: service.id,
      label: service.label,
      closedReason: seats === 0 ? reason : null,
      slots: slotsForService(service.id).map((time) => ({
        time,
        available: seats > 0 && remaining >= partySize,
        remaining,
      })),
    });
  }

  return out;
}

export class ReservationError extends Error {
  constructor(
    message: string,
    readonly field: string = 'form',
    readonly code: 'FULL' | 'DUPLICATE' | 'CLOSED' | 'UNKNOWN' = 'UNKNOWN'
  ) {
    super(message);
    this.name = 'ReservationError';
  }
}

/**
 * Crée une demande de réservation.
 *
 * Le contrôle de capacité et l'insertion se font dans UNE SEULE transaction,
 * afin que deux demandes simultanées ne puissent pas dépasser ensemble le
 * plafond. La référence est régénérée en cas de collision (improbable mais
 * possible sur 32^6 combinaisons).
 */
export async function createReservation(input: ReservationInput) {
  const service = serviceForTime(input.time);
  if (!service) throw new ReservationError('Ce créneau ne correspond à aucun service.', 'time', 'CLOSED');

  const date = parseDateOnly(input.date);

  return prisma.$transaction(async (tx) => {
    // — Anti-doublon : même personne, même date, même service.
    const existing = await tx.reservation.findFirst({
      where: {
        email: input.email,
        date,
        service,
        status: { in: OCCUPYING_STATUSES },
      },
    });
    if (existing) {
      throw new ReservationError(
        `Une demande est déjà enregistrée pour cette adresse à ce service (référence ${existing.reference}). ` +
          `Pour la modifier, appelez-nous au ${RESTAURANT.phone.display}.`,
        'email',
        'DUPLICATE'
      );
    }

    // — Contrôle de capacité.
    const override = await tx.capacityOverride.findUnique({
      where: { date_service: { date, service } },
    });
    const seats = override ? override.seats : RESTAURANT.onlineCapacity.defaultSeatsPerService;

    if (seats === 0) {
      throw new ReservationError(
        override?.reason ?? 'Ce service n’est pas réservable en ligne à cette date.',
        'date',
        'CLOSED'
      );
    }

    const used = await tx.reservation.aggregate({
      where: { date, service, status: { in: OCCUPYING_STATUSES } },
      _sum: { guests: true },
    });
    const remaining = seats - (used._sum.guests ?? 0);

    if (remaining < input.guests) {
      throw new ReservationError(
        remaining <= 0
          ? 'Ce service est complet pour les réservations en ligne. Appelez-nous, il reste souvent de la place.'
          : `Il ne reste que ${remaining} couvert${remaining > 1 ? 's' : ''} réservable${remaining > 1 ? 's' : ''} en ligne sur ce service.`,
        'guests',
        'FULL'
      );
    }

    // — Insertion, avec nouvelle référence en cas de collision.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await tx.reservation.create({
          data: {
            reference: generateReference(),
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            date,
            time: input.time,
            service,
            guests: input.guests,
            notes: input.notes ? input.notes : null,
            status: 'EN_ATTENTE',
          },
        });
      } catch (error) {
        const isUniqueViolation =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!isUniqueViolation) throw error;
      }
    }

    throw new ReservationError('Impossible d’enregistrer la réservation. Merci de réessayer.', 'form', 'UNKNOWN');
  });
}

export type AdminFilters = {
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  service?: string;
};

/** Liste filtrée pour l'administration. */
export async function listReservations(filters: AdminFilters = {}) {
  const where: Prisma.ReservationWhereInput = {};

  if (filters.status && filters.status !== 'TOUS') where.status = filters.status;
  if (filters.service && filters.service !== 'tous') where.service = filters.service;

  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date.gte = parseDateOnly(filters.from);
    if (filters.to) where.date.lte = parseDateOnly(filters.to);
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { reference: { contains: q } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q.replace(/[\s.-]/g, '') } },
    ];
  }

  return prisma.reservation.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    take: 500,
  });
}

/** Compteurs du tableau de bord. */
export async function dashboardStats(todayIso: string) {
  const today = parseDateOnly(todayIso);

  const [todayCount, todayGuests, pending, confirmed, cancelled, upcoming] = await Promise.all([
    prisma.reservation.count({ where: { date: today, status: { in: OCCUPYING_STATUSES } } }),
    prisma.reservation.aggregate({
      where: { date: today, status: { in: OCCUPYING_STATUSES } },
      _sum: { guests: true },
    }),
    prisma.reservation.count({ where: { status: 'EN_ATTENTE', date: { gte: today } } }),
    prisma.reservation.count({ where: { status: 'CONFIRMEE', date: { gte: today } } }),
    prisma.reservation.count({ where: { status: 'ANNULEE', date: { gte: today } } }),
    prisma.reservation.count({ where: { date: { gt: today }, status: { in: OCCUPYING_STATUSES } } }),
  ]);

  return {
    today: todayCount,
    todayGuests: todayGuests._sum.guests ?? 0,
    pending,
    confirmed,
    cancelled,
    upcoming,
  };
}

/** Occupation par jour sur une période, pour le calendrier de l'admin. */
export async function calendarLoad(fromIso: string, toIso: string) {
  const rows = await prisma.reservation.findMany({
    where: {
      date: { gte: parseDateOnly(fromIso), lte: parseDateOnly(toIso) },
      status: { in: OCCUPYING_STATUSES },
    },
    select: { date: true, service: true, guests: true, status: true },
  });

  const map = new Map<string, { guests: number; count: number; pending: number }>();
  for (const row of rows) {
    const key = toDateOnly(row.date);
    const entry = map.get(key) ?? { guests: 0, count: 0, pending: 0 };
    entry.guests += row.guests;
    entry.count += 1;
    if (row.status === 'EN_ATTENTE') entry.pending += 1;
    map.set(key, entry);
  }
  return map;
}
