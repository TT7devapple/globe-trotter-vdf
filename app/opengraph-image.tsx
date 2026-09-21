import { ImageResponse } from 'next/og';
import { RESTAURANT } from '@/data/restaurant';

/**
 * Image de partage (réseaux sociaux, messageries).
 *
 * Générée à la volée plutôt que dessinée dans un fichier : elle reste
 * synchronisée avec les données du restaurant, et il n'y a pas de PNG de
 * 500 ko à versionner. Elle reprend le vocabulaire graphique du site —
 * grille, points lumineux, typographie en capitales.
 */
export const runtime = 'edge';
export const alt = `${RESTAURANT.legalName} — buffet à volonté, cuisine du monde`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#05070D',
          backgroundImage:
            'radial-gradient(900px 500px at 78% 8%, rgba(124,92,255,0.30), transparent 62%),' +
            'radial-gradient(700px 480px at 10% 96%, rgba(255,122,69,0.22), transparent 66%),' +
            'radial-gradient(560px 380px at 46% 50%, rgba(61,224,255,0.14), transparent 70%)',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Bandeau supérieur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#3DE0FF',
              display: 'flex',
            }}
          />
          <div
            style={{
              display: 'flex',
              color: '#79859B',
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            World Dining Experience · {RESTAURANT.terminalCode}
          </div>
        </div>

        {/* Titre */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              color: '#E9EDF4',
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            Globe Trotter
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              color: '#3DE0FF',
              fontSize: 34,
              letterSpacing: 12,
              textTransform: 'uppercase',
            }}
          >
            Val de Fontenay
          </div>
          <div style={{ display: 'flex', marginTop: 26, color: '#A8B3C5', fontSize: 30 }}>
            Buffet à volonté · Sushi, wok, grillades, pizza, fruits de mer, desserts
          </div>
        </div>

        {/* Pied */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', color: '#E9EDF4', fontSize: 26 }}>
              {RESTAURANT.address.venue}
            </div>
            <div style={{ display: 'flex', color: '#79859B', fontSize: 22 }}>
              {RESTAURANT.address.postalCode} {RESTAURANT.address.city}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              color: '#FF7A45',
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {RESTAURANT.phone.display}
          </div>
        </div>
      </div>
    ),
    size
  );
}
