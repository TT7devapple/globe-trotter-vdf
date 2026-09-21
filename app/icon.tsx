import { ImageResponse } from 'next/og';

/**
 * Icône de l'onglet.
 *
 * Reprend la signature de marque : un globe réduit à un anneau, avec le point
 * cyan qui marque Val de Fontenay. Générée plutôt que versionnée en .ico, elle
 * reste alignée sur la palette du site — et son absence provoquait jusqu'ici
 * une erreur 404 dans la console à chaque chargement de page.
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05070D',
          borderRadius: 7,
        }}
      >
        {/* Anneau du globe */}
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: '2px solid #3DE0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Équateur */}
          <div style={{ width: 18, height: 2, background: '#3DE0FF', opacity: 0.5, display: 'flex' }} />
          {/* Position du restaurant */}
          <div
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: 6,
              height: 6,
              borderRadius: 999,
              background: '#FF7A45',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
