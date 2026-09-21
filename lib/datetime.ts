/**
 * Utilitaires de date.
 *
 * Choix de conception : une réservation porte sur une DATE CIVILE (le jour du
 * repas) et une HEURE LOCALE, pas sur un instant absolu. Stocker un instant
 * UTC exposerait à des décalages lors des changements d'heure.
 * On stocke donc la date à minuit UTC + l'heure sous forme de chaîne "HH:mm".
 */

/** Convertit "YYYY-MM-DD" en Date à minuit UTC. */
export function parseDateOnly(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Date invalide : ${iso}`);
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) throw new Error(`Date invalide : ${iso}`);
  return date;
}

/** Formate une Date en "YYYY-MM-DD" (composantes UTC). */
export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Date du jour à Paris, au format "YYYY-MM-DD". */
export function todayInParis(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/** Heure courante à Paris, au format "HH:mm". */
export function nowTimeInParis(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

/** Ajoute n jours à une date "YYYY-MM-DD". */
export function addDays(iso: string, days: number): string {
  const date = parseDateOnly(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateOnly(date);
}

/** Écart en jours entre deux dates "YYYY-MM-DD" (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseDateOnly(b).getTime() - parseDateOnly(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** "samedi 4 octobre 2026" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateOnly(iso));
}

/** "sam. 4 oct." */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parseDateOnly(iso));
}

/** Convertit "HH:mm" en minutes depuis minuit. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Nombre d'heures entre maintenant (heure de Paris) et un créneau donné.
 * Utilisé pour refuser les réservations trop tardives.
 */
export function hoursUntil(dateIso: string, time: string): number {
  const today = todayInParis();
  const dayDelta = daysBetween(today, dateIso);
  const minutesDelta = dayDelta * 24 * 60 + timeToMinutes(time) - timeToMinutes(nowTimeInParis());
  return minutesDelta / 60;
}
