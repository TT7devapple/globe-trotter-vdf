'use client';

import { useEffect, useMemo, useState } from 'react';
import { RESTAURANT } from '@/data/restaurant';
import { SERVICES } from '@/data/openingHours';
import { addDays, formatLongDate, formatShortDate, todayInParis } from '@/lib/datetime';
import type { ServiceAvailability } from '@/lib/reservations';
import ReservationConfirmation, { type ConfirmedReservation } from './ReservationConfirmation';

/**
 * Formulaire de réservation en trois étapes.
 *
 * Point important sur la promesse faite au client : le restaurant valide
 * lui-même les demandes. Le formulaire ne dit donc JAMAIS « table
 * confirmée » — il parle de « demande enregistrée », et l'écran final
 * l'explique clairement. Promettre une confirmation immédiate que le
 * restaurant n'a pas donnée se retournerait contre lui le soir même.
 */

type Step = 1 | 2 | 3;

const MAX = RESTAURANT.onlineCapacity.maxPartySizeOnline;

export default function ReservationForm() {
  const today = useMemo(() => todayInParis(), []);
  const [step, setStep] = useState<Step>(1);

  const [date, setDate] = useState(today);
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState<string | null>(null);

  const [availability, setAvailability] = useState<ServiceAvailability[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    company: '', // champ piège anti-robot
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedReservation | null>(null);

  // Les 21 prochains jours, proposés en sélection rapide
  const quickDates = useMemo(
    () => Array.from({ length: 21 }, (_, i) => addDays(today, i)),
    [today]
  );

  // Recharge les disponibilités à chaque changement de date ou de nombre de convives
  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setAvailability(null);

    fetch(`/api/availability?date=${date}&guests=${guests}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Indisponible'))))
      .then((data) => {
        if (cancelled) return;
        setAvailability(data.services as ServiceAvailability[]);
      })
      .catch(() => {
        if (!cancelled) setAvailability([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, guests]);

  // Un créneau choisi qui cesse d'être disponible doit être désélectionné
  useEffect(() => {
    if (!time || !availability) return;
    const stillFree = availability.some((s) =>
      s.slots.some((slot) => slot.time === time && slot.available)
    );
    if (!stillFree) setTime(null);
  }, [availability, time]);

  if (confirmed) {
    return <ReservationConfirmation reservation={confirmed} />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!time) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date, time, guests }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors(payload.errors ?? { form: payload.message ?? 'Une erreur est survenue.' });
        // Ramène l'utilisateur à l'étape où se trouve le problème
        if (payload.errors?.date || payload.errors?.time || payload.errors?.guests) setStep(1);
        return;
      }

      setConfirmed(payload.reservation as ConfirmedReservation);
    } catch {
      setErrors({ form: `Impossible de joindre le serveur. Appelez-nous au ${RESTAURANT.phone.display}.` });
    } finally {
      setSubmitting(false);
    }
  };

  const hasSlots = availability?.some((s) => s.slots.some((slot) => slot.available)) ?? false;

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <StepIndicator step={step} />

      {errors.form && (
        <p role="alert" className="rounded-xl border border-ember/40 bg-ember/[0.07] px-5 py-4 text-sm text-ember">
          {errors.form}
        </p>
      )}

      {/* ————————————— Étape 1 : quand, combien ————————————— */}
      {step === 1 && (
        <div className="space-y-8 animate-fade-up">
          <fieldset>
            <legend className="eyebrow mb-4">Combien de personnes ?</legend>
            <div className="scroll-x gap-2 pb-1">
              {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGuests(n)}
                  aria-pressed={guests === n}
                  className={`h-14 w-14 shrink-0 rounded-xl border font-display text-xl tabular-nums transition-all ${
                    guests === n
                      ? 'border-aurora/50 bg-aurora/[0.1] text-chrome'
                      : 'border-white/10 bg-white/[0.02] text-steel hover:border-white/25'
                  }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {n}
                  <span className="sr-only"> personne{n > 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-steel">
              À partir de {MAX + 1} personnes, appelez-nous au{' '}
              <a href={`tel:${RESTAURANT.phone.tel}`} className="text-aurora underline underline-offset-2">
                {RESTAURANT.phone.display}
              </a>{' '}
              : nous organisons les repas de groupe et disposons d’une salle privative.
            </p>
            {errors.guests && <p className="field-error">{errors.guests}</p>}
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4">Quel jour ?</legend>
            <div className="scroll-x gap-2 pb-1">
              {quickDates.map((iso) => {
                const selected = iso === date;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setDate(iso)}
                    aria-pressed={selected}
                    className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                      selected
                        ? 'border-aurora/50 bg-aurora/[0.1] text-chrome'
                        : 'border-white/10 bg-white/[0.02] text-steel hover:border-white/25'
                    }`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                      {formatShortDate(iso).split(' ')[0]}
                    </span>
                    <span className="font-display text-2xl tabular-nums">
                      {Number(iso.slice(8, 10))}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
                      {formatShortDate(iso).split(' ')[2]}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block">
              <span className="field-label">Ou choisissez une autre date</span>
              <input
                type="date"
                value={date}
                min={today}
                max={addDays(today, RESTAURANT.onlineCapacity.maxAdvanceDays)}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="field"
                aria-invalid={Boolean(errors.date)}
              />
            </label>
            {errors.date && <p className="field-error">{errors.date}</p>}
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4">
              À quelle heure ? <span className="normal-case tracking-normal text-steel/70">— {formatLongDate(date)}</span>
            </legend>

            {loadingSlots && (
              <p className="py-6 font-mono text-micro-sm uppercase text-steel" aria-live="polite">
                Recherche des disponibilités…
              </p>
            )}

            {!loadingSlots && availability && (
              <div className="space-y-6">
                {availability.map((service) => {
                  const label = SERVICES.find((s) => s.id === service.service)?.label ?? service.label;
                  const free = service.slots.filter((s) => s.available);

                  return (
                    <div key={service.service}>
                      <p className="mb-3 font-mono text-micro-sm uppercase text-titanium">{label}</p>

                      {service.closedReason ? (
                        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-steel">
                          {service.closedReason}
                        </p>
                      ) : free.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-steel">
                          Complet en ligne pour {guests} personne{guests > 1 ? 's' : ''}.{' '}
                          <a href={`tel:${RESTAURANT.phone.tel}`} className="text-aurora underline underline-offset-2">
                            Appelez-nous
                          </a>
                          , il reste souvent de la place.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {service.slots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setTime(slot.time)}
                              aria-pressed={time === slot.time}
                              className={`min-h-[44px] rounded-xl border px-4 py-2.5 font-display text-base tabular-nums transition-all ${
                                time === slot.time
                                  ? 'border-ember/50 bg-ember/[0.12] text-chrome'
                                  : slot.available
                                    ? 'border-white/10 bg-white/[0.02] text-titanium hover:border-white/30'
                                    : 'cursor-not-allowed border-white/5 bg-white/[0.01] text-steel/30 line-through'
                              }`}
                            >
                              {slot.time.replace(':', 'h')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingSlots && availability && !hasSlots && (
              <p className="mt-4 rounded-xl border border-saffron/25 bg-saffron/[0.05] px-4 py-3 text-sm text-saffron/90">
                Aucun créneau en ligne ce jour-là pour {guests} personne{guests > 1 ? 's' : ''}.
                Essayez une autre date, ou appelez-nous.
              </p>
            )}

            {errors.time && <p className="field-error">{errors.time}</p>}
          </fieldset>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!time}
            className="btn btn-primary w-full"
          >
            {time ? `Continuer — ${formatShortDate(date)} à ${time.replace(':', 'h')}` : 'Choisissez un créneau'}
          </button>
        </div>
      )}

      {/* ————————————— Étape 2 : coordonnées ————————————— */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-up">
          <Recap date={date} time={time} guests={guests} onEdit={() => setStep(1)} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="firstName"
              label="Prénom"
              value={form.firstName}
              error={errors.firstName}
              autoComplete="given-name"
              onChange={(v) => setForm({ ...form, firstName: v })}
              required
            />
            <Field
              id="lastName"
              label="Nom"
              value={form.lastName}
              error={errors.lastName}
              autoComplete="family-name"
              onChange={(v) => setForm({ ...form, lastName: v })}
              required
            />
            <Field
              id="phone"
              label="Téléphone"
              type="tel"
              inputMode="tel"
              placeholder="06 12 34 56 78"
              value={form.phone}
              error={errors.phone}
              autoComplete="tel"
              onChange={(v) => setForm({ ...form, phone: v })}
              required
              hint="Nous vous appelons uniquement pour confirmer votre table."
            />
            <Field
              id="email"
              label="E-mail"
              type="email"
              inputMode="email"
              placeholder="vous@exemple.fr"
              value={form.email}
              error={errors.email}
              autoComplete="email"
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
          </div>

          <label className="block">
            <span className="field-label">
              Demande particulière <span className="normal-case tracking-normal text-steel/60">(facultatif)</span>
            </span>
            <textarea
              rows={3}
              value={form.notes}
              maxLength={600}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anniversaire, allergie, chaise haute, fauteuil roulant, table calme…"
              className="field resize-none"
            />
            <span className="mt-1.5 block text-right font-mono text-[10px] text-steel">
              {form.notes.length} / 600
            </span>
          </label>

          {/* Champ piège : invisible pour l'humain, rempli par les robots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="company">Société</label>
            <input
              id="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost sm:flex-1">
              Retour
            </button>
            <button type="button" onClick={() => setStep(3)} className="btn btn-primary sm:flex-[2]">
              Vérifier ma demande
            </button>
          </div>
        </div>
      )}

      {/* ————————————— Étape 3 : récapitulatif ————————————— */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="rounded-panel border border-white/10 bg-hull p-6 md:p-8">
            <p className="eyebrow">Récapitulatif</p>
            <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Summary label="Date" value={formatLongDate(date)} />
              <Summary label="Heure" value={time?.replace(':', 'h') ?? '—'} />
              <Summary label="Convives" value={`${guests} personne${guests > 1 ? 's' : ''}`} />
              <Summary label="Au nom de" value={`${form.firstName} ${form.lastName}`.trim() || '—'} />
              <Summary label="Téléphone" value={form.phone || '—'} />
              <Summary label="E-mail" value={form.email || '—'} />
              {form.notes && <Summary label="Demande particulière" value={form.notes} full />}
            </dl>
          </div>

          <p className="rounded-xl border border-saffron/25 bg-saffron/[0.05] px-5 py-4 text-sm leading-relaxed text-saffron/90">
            <strong className="font-semibold">Votre table n’est pas encore confirmée.</strong> Nous
            enregistrons votre demande, puis le restaurant la valide. Vous recevrez une réponse
            avant votre venue — et en cas d’imprévu, nous vous appelons.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep(2)} className="btn btn-ghost sm:flex-1">
              Modifier
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary sm:flex-[2]">
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

/* ——————————————————— Sous-composants ——————————————————— */

function StepIndicator({ step }: { step: Step }) {
  const steps = ['Créneau', 'Coordonnées', 'Confirmation'];
  return (
    <ol className="flex items-center gap-2" aria-label={`Étape ${step} sur 3`}>
      {steps.map((label, index) => {
        const n = (index + 1) as Step;
        const state = n < step ? 'done' : n === step ? 'current' : 'todo';
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={state === 'current' ? 'step' : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${
                state === 'done'
                  ? 'border-jade/40 bg-jade/[0.1] text-jade'
                  : state === 'current'
                    ? 'border-aurora/50 bg-aurora/[0.1] text-aurora'
                    : 'border-white/10 text-steel/50'
              }`}
            >
              {state === 'done' ? '✓' : n}
            </span>
            <span
              className={`hidden font-mono text-micro-sm uppercase sm:block ${
                state === 'todo' ? 'text-steel/50' : 'text-titanium'
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Recap({
  date,
  time,
  guests,
  onEdit,
}: {
  date: string;
  time: string | null;
  guests: number;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
      <p className="font-mono text-micro-sm uppercase text-titanium">
        {formatShortDate(date)}
        <span aria-hidden="true" className="mx-2 text-steel/40">·</span>
        {time?.replace(':', 'h')}
        <span aria-hidden="true" className="mx-2 text-steel/40">·</span>
        {guests} pers.
      </p>
      <button type="button" onClick={onEdit} className="font-mono text-micro-sm uppercase text-aurora underline underline-offset-4">
        Modifier
      </button>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  required,
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'tel' | 'email' | 'text';
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-1 text-ember" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obligatoire)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="field"
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-steel">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Summary({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <dt className="font-mono text-micro-sm uppercase text-steel">{label}</dt>
      <dd className="mt-1.5 text-base leading-relaxed text-chrome">{value}</dd>
    </div>
  );
}
