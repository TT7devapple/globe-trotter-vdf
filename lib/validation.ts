import { z } from 'zod';
import { RESTAURANT } from '@/data/restaurant';
import { CLOSED_DATES, OPEN_DAYS, serviceForTime, slotsForService } from '@/data/openingHours';
import { daysBetween, hoursUntil, parseDateOnly, todayInParis } from './datetime';

export const RESERVATION_STATUSES = ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
};

/**
 * Téléphone français : accepte 0X XX XX XX XX, +33X..., espaces, points et
 * tirets. Volontairement permissif — un client ne doit pas buter sur un
 * format, le restaurant rappellera de toute façon.
 */
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export const reservationInputSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'Votre prénom est trop court.')
      .max(60, 'Votre prénom est trop long.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Votre nom est trop court.')
      .max(60, 'Votre nom est trop long.'),
    email: z.string().trim().toLowerCase().email('Adresse e-mail invalide.').max(150),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Numéro de téléphone français invalide.')
      .transform((v) => v.replace(/[\s.-]/g, '')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide.'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Heure invalide.'),
    guests: z.coerce
      .number()
      .int('Nombre de convives invalide.')
      .min(1, 'Au moins une personne.')
      .max(
        RESTAURANT.onlineCapacity.maxPartySizeOnline,
        `Pour ${RESTAURANT.onlineCapacity.maxPartySizeOnline + 1} personnes et plus, appelez-nous au ${RESTAURANT.phone.display}.`
      ),
    notes: z.string().trim().max(600, 'Message trop long (600 caractères maximum).').optional().or(z.literal('')),
    /** Champ piège anti-robot : doit rester vide. */
    company: z.string().max(0, 'Requête rejetée.').optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    // — Le créneau appartient-il à un service ?
    const service = serviceForTime(value.time);
    if (!service) {
      ctx.addIssue({ code: 'custom', path: ['time'], message: 'Ce créneau ne correspond à aucun service.' });
      return;
    }
    if (!slotsForService(service).includes(value.time)) {
      ctx.addIssue({ code: 'custom', path: ['time'], message: 'Ce créneau n’est pas proposé.' });
    }

    // — Le restaurant est-il ouvert ce jour-là ?
    let day: Date;
    try {
      day = parseDateOnly(value.date);
    } catch {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'Date invalide.' });
      return;
    }
    if (CLOSED_DATES.includes(value.date) || !OPEN_DAYS.includes(day.getUTCDay())) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'Le restaurant est fermé à cette date.' });
    }

    // — Dans la fenêtre de réservation autorisée ?
    const delta = daysBetween(todayInParis(), value.date);
    if (delta < 0) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'Cette date est déjà passée.' });
    } else if (delta > RESTAURANT.onlineCapacity.maxAdvanceDays) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: `Réservation possible jusqu’à ${RESTAURANT.onlineCapacity.maxAdvanceDays} jours à l’avance.`,
      });
    } else if (hoursUntil(value.date, value.time) < RESTAURANT.onlineCapacity.minLeadTimeHours) {
      ctx.addIssue({
        code: 'custom',
        path: ['time'],
        message: `Ce créneau est trop proche. Appelez-nous au ${RESTAURANT.phone.display}.`,
      });
    }
  });

export type ReservationInput = z.infer<typeof reservationInputSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(RESERVATION_STATUSES),
  adminNote: z.string().trim().max(600).optional(),
});

export const adminEditSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().toLowerCase().email().max(150).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  guests: z.coerce.number().int().min(1).max(200).optional(),
  notes: z.string().trim().max(600).nullable().optional(),
  adminNote: z.string().trim().max(600).nullable().optional(),
  status: z.enum(RESERVATION_STATUSES).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

/** Transforme une erreur Zod en dictionnaire champ → message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
