/**
 * HORAIRES D'OUVERTURE
 * ==========================================================================
 * ⚠ DONNÉE NON VÉRIFIÉE — voir data/verification.ts → openingHours
 *
 * Trois versions contradictoires circulent publiquement :
 *   A) 12h00–15h00 et 19h00–23h00   (RestaurantGuru, Kazfeed, @globetrotter_vdf)
 *   B) 12h00–14h30 et 19h00–22h30   (@globetrotter_valdefontenay, agrégateurs)
 *   C) 12h00–22h30 en continu       (fiche du centre commercial Aushopping)
 *
 * La version A est retenue par défaut car c'est la plus fréquemment citée,
 * MAIS elle est marquée comme non confirmée et le site invite à appeler.
 * Dès confirmation : corrigez SERVICES ci-dessous et passez
 * VERIFICATION.openingHours.verified à true.
 */

export type ServiceId = 'midi' | 'soir';

export type ServiceWindow = {
  id: ServiceId;
  label: string;
  /** Première et dernière heure d'ARRIVÉE proposées à la réservation */
  opens: string; // "HH:mm"
  closes: string; // "HH:mm"
  /**
   * Dernière arrivée acceptée en réservation en ligne, pour laisser le temps
   * de dîner avant la fermeture.
   */
  lastSeating: string;
};

export const SERVICES: ServiceWindow[] = [
  { id: 'midi', label: 'Service du midi', opens: '12:00', closes: '15:00', lastSeating: '14:00' },
  { id: 'soir', label: 'Service du soir', opens: '19:00', closes: '23:00', lastSeating: '22:00' },
];

/** 0 = dimanche … 6 = samedi. Le restaurant est ouvert 7j/7 (source concordante). */
export const OPEN_DAYS: number[] = [0, 1, 2, 3, 4, 5, 6];

export const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const DAY_LABELS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

/** Fermetures exceptionnelles (jours fériés…). Format "YYYY-MM-DD". */
export const CLOSED_DATES: string[] = [];

/** Pas de temps entre deux créneaux de réservation, en minutes. */
export const SLOT_INTERVAL_MINUTES = 30;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Créneaux d'arrivée réservables pour un service donné. */
export function slotsForService(serviceId: ServiceId): string[] {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return [];
  const slots: string[] = [];
  for (
    let t = toMinutes(service.opens);
    t <= toMinutes(service.lastSeating);
    t += SLOT_INTERVAL_MINUTES
  ) {
    slots.push(toHHMM(t));
  }
  return slots;
}

export function allSlots(): { service: ServiceWindow; slots: string[] }[] {
  return SERVICES.map((service) => ({ service, slots: slotsForService(service.id) }));
}

export function isOpenDay(date: Date): boolean {
  const iso = date.toISOString().slice(0, 10);
  if (CLOSED_DATES.includes(iso)) return false;
  return OPEN_DAYS.includes(date.getUTCDay());
}

/** Le service auquel appartient une heure, ou null si hors service. */
export function serviceForTime(time: string): ServiceId | null {
  const t = toMinutes(time);
  for (const s of SERVICES) {
    if (t >= toMinutes(s.opens) && t <= toMinutes(s.lastSeating)) return s.id;
  }
  return null;
}

/** Statut d'ouverture à l'instant T, calculé en heure de Paris. */
export function currentStatus(now: Date = new Date()): {
  open: boolean;
  label: string;
  detail: string;
} {
  const paris = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const minutes = paris.getHours() * 60 + paris.getMinutes();
  const day = paris.getDay();

  if (!OPEN_DAYS.includes(day)) {
    return { open: false, label: 'Fermé', detail: 'Réouverture prochainement' };
  }

  for (const s of SERVICES) {
    if (minutes >= toMinutes(s.opens) && minutes < toMinutes(s.closes)) {
      return { open: true, label: 'Ouvert', detail: `${s.label} jusqu’à ${s.closes}` };
    }
  }

  const next = SERVICES.find((s) => minutes < toMinutes(s.opens));
  return next
    ? { open: false, label: 'Fermé', detail: `${next.label} à partir de ${next.opens}` }
    : { open: false, label: 'Fermé', detail: `Réouverture demain à ${SERVICES[0].opens}` };
}

/** Format schema.org openingHoursSpecification. */
export function schemaOpeningHours() {
  const daysMap = [
    'https://schema.org/Sunday',
    'https://schema.org/Monday',
    'https://schema.org/Tuesday',
    'https://schema.org/Wednesday',
    'https://schema.org/Thursday',
    'https://schema.org/Friday',
    'https://schema.org/Saturday',
  ];
  return SERVICES.map((s) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: OPEN_DAYS.map((d) => daysMap[d]),
    opens: s.opens,
    closes: s.closes,
  }));
}
