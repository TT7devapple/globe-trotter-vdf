import type { Config } from 'tailwindcss';

/**
 * DIRECTION ARTISTIQUE — « TERMINAL 94 »
 * ------------------------------------------------------------------
 * Le site est conçu comme l'interface d'un terminal de vol gastronomique.
 * Le restaurant est le terminal, chaque univers culinaire est une
 * destination, le repas est le voyage. Le vocabulaire visuel emprunte aux
 * écrans de navigation aérienne (grilles, coordonnées, trajectoires,
 * codes IATA) mais traité avec une retenue « premium » : peu de couleurs
 * saturées, beaucoup de noir profond, des accents lumineux rares.
 *
 * Le nom « Terminal 94 » fait référence au département du Val-de-Marne (94).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ——— Fonds : du plus profond au plus clair
        void: '#05070D',
        abyss: '#080C16',
        hull: '#0E1420',
        deck: '#161E2E',
        // ——— Neutres
        steel: '#79859B',
        titanium: '#A8B3C5',
        chrome: '#E9EDF4',
        // ——— Accents (usage parcimonieux : lignes, data, focus)
        aurora: '#3DE0FF', // cyan signature — trajectoires, données
        plasma: '#7C5CFF', // violet électrique — profondeur, nuit
        ember: '#FF7A45', // orange braise — grillades, chaleur, CTA
        saffron: '#FFC24B', // doré — desserts, lumière chaude
        jade: '#34E5A0', // vert — statuts positifs, confirmations
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Échelle fluide : les grands titres respirent sans média-queries
        'display-xl': ['clamp(3.2rem, 13vw, 11rem)', { lineHeight: '0.85', letterSpacing: '-0.045em' }],
        'display-lg': ['clamp(2.6rem, 8vw, 6.5rem)', { lineHeight: '0.9', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(2rem, 5.2vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.6rem, 3.4vw, 2.6rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        // Micro-labels type panneau d'aéroport
        micro: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.24em' }],
        'micro-sm': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.2em' }],
      },
      maxWidth: { shell: '88rem' },
      borderRadius: { panel: '1.5rem' },
      backgroundImage: {
        // Grille de navigation fine, utilisée en surimpression
        grid: `linear-gradient(to right, rgba(122,134,153,0.07) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(122,134,153,0.07) 1px, transparent 1px)`,
        'aurora-sweep': 'linear-gradient(100deg, transparent 20%, rgba(61,224,255,0.16) 50%, transparent 80%)',
      },
      backgroundSize: { grid: '64px 64px', 'grid-sm': '32px 32px' },
      boxShadow: {
        glow: '0 0 0 1px rgba(61,224,255,0.22), 0 18px 60px -20px rgba(61,224,255,0.45)',
        'glow-ember': '0 0 0 1px rgba(255,122,69,0.26), 0 18px 60px -20px rgba(255,122,69,0.5)',
        panel: '0 32px 80px -40px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(22px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'none' } },
        // Point lumineux d'une destination sur la carte
        'ping-soft': { '0%': { transform: 'scale(1)', opacity: '0.55' }, '70%,100%': { transform: 'scale(3.2)', opacity: '0' } },
        // Balayage lumineux horizontal (CTA, séparateurs)
        sweep: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-14px,0)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.75s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.9s ease both',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'ping-soft': 'ping-soft 2.8s cubic-bezier(0,0,0.2,1) infinite',
        sweep: 'sweep 2.6s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
        'spin-slow': 'spin-slow 44s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
