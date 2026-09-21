import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { calendarLoad, dashboardStats, listReservations } from '@/lib/reservations';
import { todayInParis, addDays, toDateOnly } from '@/lib/datetime';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { pendingVerifications } from '@/data/verification';

export const metadata: Metadata = {
  title: 'Tableau de bord — Administration',
  robots: { index: false, follow: false },
};

/** Toujours à jour : aucune mise en cache des réservations. */
export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const today = todayInParis();

  const filters = {
    status: single('status') ?? 'TOUS',
    service: single('service') ?? 'tous',
    from: single('from') ?? today,
    to: single('to') ?? addDays(today, 30),
    search: single('q') ?? '',
  };

  const [stats, reservations, load] = await Promise.all([
    dashboardStats(today),
    listReservations(filters),
    calendarLoad(today, addDays(today, 41)),
  ]);

  return (
    <AdminDashboard
      session={{ email: session.email, name: session.name ?? null }}
      stats={stats}
      today={today}
      filters={filters}
      pending={pendingVerifications()}
      calendar={Object.fromEntries(load)}
      reservations={reservations.map((r) => ({
        id: r.id,
        reference: r.reference,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone,
        date: toDateOnly(r.date),
        time: r.time,
        service: r.service,
        guests: r.guests,
        notes: r.notes,
        status: r.status,
        adminNote: r.adminNote,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
