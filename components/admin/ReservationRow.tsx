'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STATUS_LABELS, type ReservationStatus } from '@/lib/validation';
import { slotsForService } from '@/data/openingHours';

export type AdminReservation = {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  guests: number;
  notes: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  EN_ATTENTE: 'border-saffron/35 bg-saffron/[0.08] text-saffron',
  CONFIRMEE: 'border-jade/35 bg-jade/[0.08] text-jade',
  ANNULEE: 'border-white/15 bg-white/[0.03] text-steel',
};

/**
 * Ligne de réservation, dépliable pour édition.
 *
 * Les actions les plus fréquentes (confirmer, annuler) sont accessibles sans
 * ouvrir la fiche : en coup de feu, on ne veut pas cliquer trois fois pour
 * valider une table. La suppression, elle, est volontairement cachée dans la
 * fiche dépliée et demande confirmation — c'est la seule action irréversible.
 */
export default function ReservationRow({ reservation }: { reservation: AdminReservation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    phone: reservation.phone,
    email: reservation.email,
    adminNote: reservation.adminNote ?? '',
  });

  const patch = async (data: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.message ?? 'Modification impossible.');
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError('Le serveur ne répond pas.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const confirmed = window.confirm(
      `Supprimer définitivement la réservation ${reservation.reference} ` +
        `(${reservation.firstName} ${reservation.lastName}) ?\n\n` +
        `Cette action est irréversible. Pour conserver une trace, préférez « Annuler ».`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, { method: 'DELETE' });
      if (!response.ok) {
        setError('Suppression impossible.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const status = reservation.status as ReservationStatus;

  return (
    <div
      className={`rounded-2xl border bg-hull transition-colors ${
        status === 'EN_ATTENTE' ? 'border-saffron/25' : 'border-white/10'
      }`}
    >
      {/* Ligne compacte */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4">
        <span className="font-display text-2xl tabular-nums text-chrome">
          {reservation.time.replace(':', 'h')}
        </span>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 font-display text-base tabular-nums text-titanium">
          {reservation.guests}
          <span className="sr-only"> couverts</span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-chrome">
            {reservation.firstName} {reservation.lastName}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 font-mono text-micro-sm uppercase text-steel">
            <span>{reservation.reference}</span>
            <a href={`tel:${reservation.phone}`} className="text-aurora hover:underline">
              {reservation.phone}
            </a>
          </p>
        </div>

        <span className={`chip ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status]}</span>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {status !== 'CONFIRMEE' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => patch({ status: 'CONFIRMEE' })}
              className="rounded-lg border border-jade/35 bg-jade/[0.08] px-3 py-2 font-mono text-micro-sm uppercase text-jade transition-colors hover:bg-jade/[0.15] disabled:opacity-40"
            >
              Confirmer
            </button>
          )}
          {status !== 'ANNULEE' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => patch({ status: 'ANNULEE' })}
              className="rounded-lg border border-white/15 px-3 py-2 font-mono text-micro-sm uppercase text-steel transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-40"
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-steel transition-colors hover:text-chrome"
          >
            <span className="sr-only">{open ? 'Replier' : 'Voir le détail'}</span>
            <svg
              viewBox="0 0 16 16"
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Demande du client, toujours visible : c'est ce qu'on oublie le plus */}
      {reservation.notes && (
        <p className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-titanium">
          <span className="font-mono text-micro-sm uppercase text-steel">Demande — </span>
          {reservation.notes}
        </p>
      )}

      {/* Fiche dépliée */}
      {open && (
        <div className="space-y-5 border-t border-white/10 p-4">
          {error && (
            <p role="alert" className="rounded-lg border border-ember/40 bg-ember/[0.07] px-4 py-3 text-sm text-ember">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="field-label">Date</span>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="field !py-2.5"
              />
            </label>

            <label>
              <span className="field-label">Heure</span>
              <select
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                className="field !py-2.5"
              >
                {[...slotsForService('midi'), ...slotsForService('soir')].map((slot) => (
                  <option key={slot} value={slot} className="bg-hull">
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Couverts</span>
              <input
                type="number"
                min={1}
                max={200}
                value={draft.guests}
                onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })}
                className="field !py-2.5"
              />
            </label>

            <label>
              <span className="field-label">Téléphone</span>
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="field !py-2.5"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">E-mail</span>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="field !py-2.5"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">Note interne</span>
              <input
                type="text"
                value={draft.adminNote}
                maxLength={600}
                placeholder="Table 12, habitué, rappeler avant 18h…"
                onChange={(e) => setDraft({ ...draft, adminNote: e.target.value })}
                className="field !py-2.5"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const ok = await patch(draft);
                if (ok) setOpen(false);
              }}
              className="btn btn-primary !min-h-0 !px-5 !py-2.5"
            >
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>

            <a href={`mailto:${reservation.email}`} className="btn btn-ghost !min-h-0 !px-5 !py-2.5">
              Écrire au client
            </a>

            <button
              type="button"
              disabled={busy}
              onClick={remove}
              className="ml-auto font-mono text-micro-sm uppercase text-steel transition-colors hover:text-ember"
            >
              Supprimer définitivement
            </button>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-wider text-steel/60">
            Demande reçue le{' '}
            {new Date(reservation.createdAt).toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
            {' · '}
            {reservation.email}
          </p>
        </div>
      )}
    </div>
  );
}
