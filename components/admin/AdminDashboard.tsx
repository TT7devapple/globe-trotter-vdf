'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { STATUS_LABELS } from '@/lib/validation';
import { addDays, formatLongDate } from '@/lib/datetime';
import { DAY_LABELS_SHORT } from '@/data/openingHours';
import type { VerificationEntry } from '@/data/verification';
import Wordmark from '../Wordmark';
import ReservationRow, { type AdminReservation } from './ReservationRow';

type Stats = {
  today: number;
  todayGuests: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  upcoming: number;
};

/**
 * Tableau de bord des réservations.
 *
 * Trois vues d'une même liste : la liste détaillée, un calendrier de charge
 * sur six semaines, et les points de données à confirmer. Les filtres passent
 * par l'URL — le restaurant peut mettre en favori « les demandes en attente »
 * et y revenir d'un clic.
 */
export default function AdminDashboard({
  session,
  stats,
  today,
  filters,
  reservations,
  calendar,
  pending,
}: {
  session: { email: string; name: string | null };
  stats: Stats;
  today: string;
  filters: { status: string; service: string; from: string; to: string; search: string };
  reservations: AdminReservation[];
  calendar: Record<string, { guests: number; count: number; pending: number }>;
  pending: VerificationEntry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<'liste' | 'calendrier' | 'donnees'>('liste');
  const [search, setSearch] = useState(filters.search);

  const applyFilters = (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    const query = new URLSearchParams();
    if (merged.status !== 'TOUS') query.set('status', merged.status);
    if (merged.service !== 'tous') query.set('service', merged.service);
    if (merged.from) query.set('from', merged.from);
    if (merged.to) query.set('to', merged.to);
    if (merged.search) query.set('q', merged.search);

    startTransition(() => {
      router.push(`/admin?${query.toString()}`);
    });
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  };

  // Six semaines à partir du lundi de la semaine courante
  const calendarDays = useMemo(() => {
    const start = new Date(`${today}T00:00:00Z`);
    const weekday = (start.getUTCDay() + 6) % 7; // lundi = 0
    const firstDay = addDays(today, -weekday);
    return Array.from({ length: 42 }, (_, i) => addDays(firstDay, i));
  }, [today]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdminReservation[]>();
    for (const reservation of reservations) {
      const list = map.get(reservation.date) ?? [];
      list.push(reservation);
      map.set(reservation.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [reservations]);

  return (
    <div className="min-h-[100svh] bg-void pb-24">
      {/* ——— En-tête ——— */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-void/90 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Wordmark className="h-7 w-auto" />
            <span className="hidden rounded-full border border-aurora/30 bg-aurora/[0.07] px-3 py-1 font-mono text-micro-sm uppercase text-aurora sm:inline-flex">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-micro-sm uppercase text-steel md:inline">
              {session.name ?? session.email}
            </span>
            <Link href="/" className="btn btn-quiet !min-h-0 !px-3 !py-2">
              Voir le site
            </Link>
            <button type="button" onClick={logout} className="btn btn-ghost !min-h-0 !px-4 !py-2">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="shell pt-10">
        <h1 className="font-display text-display-sm font-semibold uppercase">Tableau de bord</h1>
        <p className="mt-2 font-mono text-micro-sm uppercase text-steel">
          {formatLongDate(today)}
        </p>

        {/* ——— Compteurs ——— */}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-white/10 bg-white/5 lg:grid-cols-5">
          <StatCard label="Aujourd’hui" value={stats.today} note={`${stats.todayGuests} couverts`} />
          <StatCard label="En attente" value={stats.pending} note="À traiter" accent="saffron" />
          <StatCard label="Confirmées" value={stats.confirmed} note="À venir" accent="jade" />
          <StatCard label="À venir" value={stats.upcoming} note="Après aujourd’hui" />
          <StatCard label="Annulées" value={stats.cancelled} note="À venir" />
        </dl>

        {/* Alerte sur les demandes en attente */}
        {stats.pending > 0 && (
          <button
            type="button"
            onClick={() => applyFilters({ status: 'EN_ATTENTE' })}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-saffron/30 bg-saffron/[0.06] px-5 py-4 text-left transition-colors hover:bg-saffron/[0.1]"
          >
            <span aria-hidden="true" className="text-saffron">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                <path d="M8 1.5 15 14H1L8 1.5Zm0 4.2a.8.8 0 0 0-.8.8v2.6a.8.8 0 0 0 1.6 0V6.5a.8.8 0 0 0-.8-.8Zm0 5.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
              </svg>
            </span>
            <span className="flex-1 text-sm text-saffron/90">
              <strong className="font-semibold">
                {stats.pending} demande{stats.pending > 1 ? 's' : ''} en attente
              </strong>{' '}
              — le client attend votre validation.
            </span>
            <span aria-hidden="true" className="font-mono text-micro-sm uppercase text-saffron">
              Voir
            </span>
          </button>
        )}

        {/* ——— Onglets ——— */}
        <div className="mt-10 flex gap-2 border-b border-white/10" role="tablist">
          {(['liste', 'calendrier', 'donnees'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={view === tab}
              onClick={() => setView(tab)}
              className={`relative px-4 py-3 font-mono text-micro-sm uppercase transition-colors ${
                view === tab ? 'text-chrome' : 'text-steel hover:text-titanium'
              }`}
            >
              {tab === 'liste' ? 'Réservations' : tab === 'calendrier' ? 'Calendrier' : 'Données à confirmer'}
              {tab === 'donnees' && pending.length > 0 && (
                <span className="ml-2 rounded-full bg-saffron/20 px-1.5 py-0.5 text-[10px] text-saffron">
                  {pending.length}
                </span>
              )}
              {view === tab && (
                <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-aurora" />
              )}
            </button>
          ))}
        </div>

        {/* ——— Vue liste ——— */}
        {view === 'liste' && (
          <div className="mt-8">
            {/* Filtres */}
            <div className="space-y-4 rounded-panel border border-white/10 bg-hull p-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyFilters({ search });
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <label className="flex-1">
                  <span className="sr-only">Rechercher une réservation</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom, référence, e-mail, téléphone…"
                    className="field"
                  />
                </label>
                <button type="submit" className="btn btn-ghost">
                  Rechercher
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {(['TOUS', 'EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => applyFilters({ status })}
                    aria-pressed={filters.status === status}
                    className={`rounded-full border px-3.5 py-2 font-mono text-micro-sm uppercase transition-all ${
                      filters.status === status
                        ? 'border-aurora/45 bg-aurora/[0.1] text-chrome'
                        : 'border-white/10 bg-white/[0.02] text-steel hover:border-white/25'
                    }`}
                  >
                    {status === 'TOUS' ? 'Tous' : STATUS_LABELS[status]}
                  </button>
                ))}

                <span aria-hidden="true" className="mx-1 w-px bg-white/10" />

                {(['tous', 'midi', 'soir'] as const).map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => applyFilters({ service })}
                    aria-pressed={filters.service === service}
                    className={`rounded-full border px-3.5 py-2 font-mono text-micro-sm uppercase transition-all ${
                      filters.service === service
                        ? 'border-aurora/45 bg-aurora/[0.1] text-chrome'
                        : 'border-white/10 bg-white/[0.02] text-steel hover:border-white/25'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="font-mono text-micro-sm uppercase text-steel">Du</span>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => applyFilters({ from: e.target.value })}
                    className="field !w-auto !py-2"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-mono text-micro-sm uppercase text-steel">Au</span>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => applyFilters({ to: e.target.value })}
                    className="field !w-auto !py-2"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    startTransition(() => router.push('/admin'));
                  }}
                  className="btn btn-quiet !min-h-0 !px-3 !py-2"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {isPending && (
              <p className="mt-4 font-mono text-micro-sm uppercase text-steel" aria-live="polite">
                Chargement…
              </p>
            )}

            {/* Liste groupée par jour */}
            <div className="mt-6 space-y-8">
              {grouped.length === 0 && (
                <p className="rounded-panel border border-white/10 bg-hull px-6 py-12 text-center text-titanium">
                  Aucune réservation ne correspond à ces critères.
                </p>
              )}

              {grouped.map(([date, items]) => (
                <section key={date}>
                  <h2 className="flex items-baseline gap-3 border-b border-white/10 pb-3">
                    <span className="font-display text-xl text-chrome">{formatLongDate(date)}</span>
                    <span className="font-mono text-micro-sm uppercase text-steel">
                      {items.length} réservation{items.length > 1 ? 's' : ''} ·{' '}
                      {items.reduce((sum, r) => sum + r.guests, 0)} couverts
                    </span>
                    {date === today && (
                      <span className="chip border-aurora/35 bg-aurora/[0.08] text-aurora">
                        Aujourd’hui
                      </span>
                    )}
                  </h2>

                  <ul className="mt-4 space-y-3">
                    {items.map((reservation) => (
                      <li key={reservation.id}>
                        <ReservationRow reservation={reservation} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* ——— Vue calendrier ——— */}
        {view === 'calendrier' && (
          <div className="mt-8 rounded-panel border border-white/10 bg-hull p-5">
            <p className="eyebrow mb-4">Charge sur six semaines</p>

            <div className="grid grid-cols-7 gap-1.5">
              {DAY_LABELS_SHORT.slice(1).concat(DAY_LABELS_SHORT[0]).map((label) => (
                <div key={label} className="pb-2 text-center font-mono text-[10px] uppercase tracking-wider text-steel">
                  {label}
                </div>
              ))}

              {calendarDays.map((iso) => {
                const load = calendar[iso];
                const isToday = iso === today;
                const isPast = iso < today;

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => applyFilters({ from: iso, to: iso, status: 'TOUS' })}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-1 transition-all ${
                      isToday
                        ? 'border-aurora/50 bg-aurora/[0.08]'
                        : load
                          ? 'border-white/15 bg-white/[0.04] hover:border-white/30'
                          : 'border-white/5 bg-white/[0.01] hover:border-white/15'
                    } ${isPast ? 'opacity-40' : ''}`}
                  >
                    <span className={`font-display text-sm tabular-nums ${isToday ? 'text-aurora' : 'text-titanium'}`}>
                      {Number(iso.slice(8, 10))}
                    </span>
                    {load && (
                      <>
                        <span className="font-mono text-[9px] text-chrome">{load.guests} c.</span>
                        {load.pending > 0 && (
                          <span
                            className="h-1 w-1 rounded-full bg-saffron"
                            aria-label={`${load.pending} en attente`}
                          />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-steel">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-saffron" aria-hidden="true" /> Demandes en attente
              </span>
              <span>c. = couverts</span>
              <span>Cliquez sur un jour pour filtrer la liste</span>
            </p>
          </div>
        )}

        {/* ——— Vue données à confirmer ——— */}
        {view === 'donnees' && (
          <div className="mt-8 space-y-4">
            <p className="rounded-panel border border-white/10 bg-hull px-6 py-5 leading-relaxed text-titanium">
              Ces informations n&rsquo;ont pas pu être vérifiées lors de la création du site. Elles
              sont <strong className="text-chrome">masquées ou signalées</strong> sur le site public
              plutôt qu&rsquo;affichées au hasard. Confirmez-les, puis suivez les indications de
              chaque fiche pour les activer.
            </p>

            {pending.map((entry) => (
              <details
                key={entry.label}
                className="group rounded-panel border border-saffron/20 bg-saffron/[0.04] p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-lg text-chrome">{entry.label}</span>
                  <span className="font-mono text-micro-sm uppercase text-saffron transition-transform group-open:rotate-180">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-saffron/85">{entry.note}</p>
                {entry.checkedOn && (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-steel">
                    Dernière vérification : {entry.checkedOn}
                  </p>
                )}
              </details>
            ))}

            {pending.length === 0 && (
              <p className="rounded-panel border border-jade/25 bg-jade/[0.05] px-6 py-8 text-center text-jade">
                Toutes les données ont été confirmées.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: number;
  note: string;
  accent?: 'saffron' | 'jade';
}) {
  const color =
    accent === 'saffron' ? 'text-saffron' : accent === 'jade' ? 'text-jade' : 'text-chrome';

  return (
    <div className="bg-abyss p-5">
      <dt className="font-mono text-micro-sm uppercase text-steel">{label}</dt>
      <dd>
        <span className={`mt-2 block font-display text-4xl font-bold tabular-nums ${color}`}>
          {value}
        </span>
        <span className="mt-1 block text-[11px] text-steel">{note}</span>
      </dd>
    </div>
  );
}
