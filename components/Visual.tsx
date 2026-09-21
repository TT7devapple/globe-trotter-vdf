type Accent = 'aurora' | 'ember' | 'saffron' | 'plasma' | 'jade';

const ACCENT: Record<Accent, { surface: string; glow: string; rim: string; warm: string }> = {
  aurora: { surface: '#080F16', glow: '61,224,255', rim: '#3DE0FF', warm: '255,196,140' },
  ember: { surface: '#160B06', glow: '255,122,69', rim: '#FF7A45', warm: '255,178,120' },
  saffron: { surface: '#171004', glow: '255,194,75', rim: '#FFC24B', warm: '255,206,140' },
  plasma: { surface: '#0D0A1C', glow: '124,92,255', rim: '#7C5CFF', warm: '200,180,255' },
  jade: { surface: '#04140F', glow: '52,229,160', rim: '#34E5A0', warm: '190,255,225' },
};

/**
 * Emplacement visuel, en attente de photographie.
 *
 * ── Ce que c'est, et ce que ce n'est pas ────────────────────────────────
 * Ce composant ne représente PAS un plat. Aucune photographie de Globe
 * Trotter Val de Fontenay n'est libre de droits, et aucun visuel culinaire
 * n'a été fabriqué : il n'y a ici ni nourriture, ni imitation de nourriture.
 *
 * La composition met en scène une *surface dressée sous un éclairage de
 * studio* — plan de travail sombre, halo directionnel, assiette en contre-
 * jour, ombre portée. Elle installe donc la lumière et le cadre d'une photo
 * culinaire, en laissant le sujet vide. L'emplacement se lit comme délibéré
 * plutôt que manquant, et la substitution est immédiate : voir data/images.ts.
 *
 * ── Déterminisme ────────────────────────────────────────────────────────
 * Le motif dérive d'un hachage de l'identifiant. Un même emplacement produit
 * toujours exactement la même image, sur le serveur comme dans le navigateur :
 * aucun risque d'écart d'hydratation, et rien à télécharger — la composition
 * ne pèse que quelques centaines d'octets de balisage.
 */
export default function Visual({
  id,
  accent = 'aurora',
  label,
  className = '',
}: {
  id: string;
  accent?: Accent;
  /** Libellé discret affiché en surimpression */
  label?: string;
  className?: string;
}) {
  const palette = ACCENT[accent];
  const seed = hash(id);

  // Paramètres dérivés de l'identifiant, bornés pour rester crédibles.
  const lightX = 26 + (seed % 46); // position horizontale de la source
  const lightY = 12 + ((seed >> 4) % 26); // hauteur de la source
  const plateY = 62 + ((seed >> 7) % 12); // hauteur de la surface dressée
  const plateW = 46 + ((seed >> 10) % 20); // largeur de l'assiette
  const rotate = -8 + ((seed >> 13) % 17); // légère désaxation

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: palette.surface }}
      role="img"
      aria-label={label ?? 'Emplacement photographique'}
    >
      {/* Éclairage principal : une source haute, décalée, comme en studio */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(58% 48% at ${lightX}% ${lightY}%, rgba(${palette.warm},0.30), transparent 62%),` +
            `radial-gradient(75% 60% at ${lightX}% ${plateY - 10}%, rgba(${palette.glow},0.26), transparent 70%),` +
            `radial-gradient(120% 90% at 50% 120%, rgba(0,0,0,0.55), transparent 60%)`,
        }}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id={`plate-${id}`} cx="42%" cy="35%">
            <stop offset="0%" stopColor={palette.rim} stopOpacity="0.16" />
            <stop offset="70%" stopColor={palette.rim} stopOpacity="0.05" />
            <stop offset="100%" stopColor={palette.rim} stopOpacity="0.02" />
          </radialGradient>
          <linearGradient id={`shadow-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`rotate(${rotate} 50 ${plateY})`}>
          {/* Ombre portée sur le plan de travail */}
          <ellipse
            cx="50"
            cy={plateY + 5}
            rx={plateW / 2 + 5}
            ry={plateW / 9}
            fill={`url(#shadow-${id})`}
          />

          {/* Assiette : disque en perspective, cerclé d'un liseré lumineux */}
          <ellipse
            cx="50"
            cy={plateY}
            rx={plateW / 2}
            ry={plateW / 7}
            fill={`url(#plate-${id})`}
            stroke={palette.rim}
            strokeOpacity="0.22"
            strokeWidth="0.4"
          />
          <ellipse
            cx="50"
            cy={plateY}
            rx={plateW / 2.9}
            ry={plateW / 11}
            fill="none"
            stroke={palette.rim}
            strokeOpacity="0.12"
            strokeWidth="0.3"
          />

          {/* Contre-jour sur le bord supérieur de l'assiette */}
          <path
            d={`M ${50 - plateW / 2} ${plateY} A ${plateW / 2} ${plateW / 7} 0 0 1 ${50 + plateW / 2} ${plateY}`}
            fill="none"
            stroke={palette.rim}
            strokeOpacity="0.32"
            strokeWidth="0.45"
          />
        </g>

        {/* Ligne d'horizon du plan de travail, très estompée */}
        <line
          x1="0"
          y1={plateY - plateW / 5}
          x2="100"
          y2={plateY - plateW / 5}
          stroke={palette.rim}
          strokeOpacity="0.07"
          strokeWidth="0.3"
        />
      </svg>

      {/* Grain fin : évite l'aspect « dégradé plat » */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignetage et voile bas, pour la lisibilité des légendes */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 80px 24px rgba(0,0,0,0.55)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-void/75 via-transparent to-transparent"
      />

      {label && (
        <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          {label}
        </span>
      )}
    </div>
  );
}

/** Hachage stable d'une chaîne — même valeur sur le serveur et le client. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
