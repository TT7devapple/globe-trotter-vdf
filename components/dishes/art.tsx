import type { ReactNode } from 'react';
import type { IllustrationKind } from '@/data/menu';

/**
 * PLANCHES D'ILLUSTRATION DES PLATS
 * ==========================================================================
 * Style « planche technique » : trait fin clair pour les contours, gris pour
 * les détails, teintes d'accent très sombres pour les volumes, filets
 * d'annotation en monospace. C'est le vocabulaire du reste du site — grilles,
 * coordonnées, panneaux d'embarquement — appliqué à la cuisine.
 *
 * Toutes les planches partagent le même repère : 400 × 300, plan de travail
 * vers y = 230. Les remplissages sombres servent aussi d'occultation : un
 * élément placé devant masque les traits de celui qui est derrière.
 *
 * Classes utilisées par l'animation de tracé (voir styles/globals.css) :
 *   ds  trait qui se dessine      d2 / d3 / d4  vagues successives
 *   df  remplissage qui apparaît en fondu
 *
 * RÈGLE : une planche n'existe que pour un plat présent dans data/menu.ts, et
 * ses annotations ne nomment que ce que la carte du restaurant mentionne.
 */

/* ───────────────────────────── Palette ───────────────────────────── */

const BG = '#0A0F17';

/** Mélange une couleur d'accent avec le fond : teinte sombre pour les volumes. */
function tint(hex: string, amount: number): string {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(BG);
  const [r2, g2, b2] = parse(hex);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const ACCENT_HEX = {
  aurora: '#3DE0FF',
  ember: '#FF7A45',
  saffron: '#FFC24B',
  plasma: '#7C5CFF',
  jade: '#34E5A0',
} as const;

const P = {
  line: '#E9EDF4',
  detail: '#A8B3C5',
  bg: BG,
  bg2: '#0E1520',
  rice: '#19212C',
  nori: '#0B1511',
  ...ACCENT_HEX,
  tEmber: tint(ACCENT_HEX.ember, 0.24),
  tSaffron: tint(ACCENT_HEX.saffron, 0.22),
  tJade: tint(ACCENT_HEX.jade, 0.22),
  tAurora: tint(ACCENT_HEX.aurora, 0.2),
  tPlasma: tint(ACCENT_HEX.plasma, 0.26),
};

/* ──────────────────────────── Styles de trait ─────────────────────────── */

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Contour principal */
const L = { ...round, fill: 'none', stroke: P.line, strokeOpacity: 0.9, strokeWidth: 1.3, pathLength: 1, className: 'ds' };
/** Détail secondaire */
const D = { ...round, fill: 'none', stroke: P.detail, strokeOpacity: 0.5, strokeWidth: 0.8, pathLength: 1, className: 'ds d2' };
/** Rehaut coloré */
const A = (color: string, opacity = 0.9) => ({
  ...round,
  fill: 'none',
  stroke: color,
  strokeOpacity: opacity,
  strokeWidth: 1.15,
  pathLength: 1,
  className: 'ds d3',
});

/* ───────────────────────────── Éléments communs ───────────────────────────── */

function Shadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={0.45} className="df" />;
}

/** Vapeur : trois ondulations qui s'élèvent. Animée en boucle, très lentement. */
function Steam({ x, y, h = 60, delay = 0 }: { x: number; y: number; h?: number; delay?: number }) {
  const s = h / 3;
  const wave = `c -6 ${-s * 0.4} 6 ${-s * 0.6} 0 ${-s}`;
  return (
    <g className="steam" style={{ animationDelay: `${delay}ms` }}>
      <path {...D} strokeOpacity={0.42} d={`M${x} ${y} ${wave} ${wave} ${wave}`} />
    </g>
  );
}

/** Flamme de brûleur, qui vacille légèrement. */
function Flame({ x, y, h, delay = 0 }: { x: number; y: number; h: number; delay?: number }) {
  return (
    <g className="flicker" style={{ animationDelay: `${delay}ms` }}>
      <path
        {...A(P.ember, 0.85)}
        fill={P.tEmber}
        d={`M${x} ${y} C${x - 6} ${y - h * 0.4} ${x + 3} ${y - h * 0.6} ${x} ${y - h} C${x + 8} ${y - h * 0.55} ${x + 7} ${y - h * 0.25} ${x + 2} ${y} Z`}
      />
    </g>
  );
}

/** Points répartis dans une demi-ellipse (grains de riz), suite de Fibonacci. */
function spread(cx: number, cy: number, rx: number, ry: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996;
    return {
      x: cx + r * Math.cos(a) * rx,
      y: cy - Math.abs(r * Math.sin(a)) * ry,
      rot: (i * 47) % 180,
    };
  });
}

/* ════════════════════════════════ Planches ════════════════════════════════ */

function Sushi() {
  return (
    <>
      <Shadow cx={200} cy={250} rx={170} ry={10} />
      {/* Planche de service */}
      <path {...L} fill={P.bg2} d="M62 214 L338 214 L356 238 L44 238 Z" />
      <path {...D} d="M44 238 L44 245 L356 245 L356 238" />
      <path {...D} strokeOpacity={0.22} d="M88 222 L312 222 M70 230 L330 230" />

      {/* Nigiri arrière */}
      <rect {...L} fill={P.rice} x={206} y={168} width={104} height={32} rx={14} />
      <path
        {...L}
        fill={P.tEmber}
        d="M198 180 C204 158 232 150 262 152 C292 154 314 162 318 176 C316 182 308 181 300 179 C276 173 240 174 212 184 C204 187 197 186 198 180 Z"
      />
      <path {...A(P.ember, 0.5)} d="M224 162 C230 168 233 174 234 180 M246 156 C252 164 256 170 257 176 M270 155 C276 162 279 168 280 174 M292 158 C297 164 299 169 300 174" />

      {/* Nigiri avant */}
      <rect {...L} fill={P.rice} x={108} y={186} width={112} height={34} rx={15} />
      <path {...D} d="M124 207 l5 -2 M140 213 l5 -1 M160 208 l4 2 M182 213 l5 -2 M204 206 l3 3 M150 200 l4 1" />
      <path
        {...L}
        fill={P.tEmber}
        d="M100 198 C106 174 136 166 168 168 C200 170 224 178 228 193 C226 199 217 198 208 196 C182 190 144 191 114 201 C106 204 99 203 100 198 Z"
      />
      <path {...A(P.ember, 0.5)} d="M126 178 C132 185 135 192 136 198 M150 172 C156 180 159 187 160 193 M176 171 C182 178 185 185 186 191 M200 174 C205 180 207 186 208 191" />

      {/* Wasabi et gingembre */}
      <path {...L} fill={P.tJade} d="M78 228 C74 220 84 214 92 218 C100 214 108 222 102 228 Z" />
      <path {...A(P.plasma, 0.6)} fill={P.tPlasma} d="M292 230 C286 220 306 216 310 226 Z M304 230 C302 220 320 218 322 228 Z" />

      {/* Baguettes sur leur repose-baguettes */}
      <rect {...L} fill={P.bg2} x={350} y={198} width={28} height={9} rx={4.5} />
      <path {...L} d="M288 66 L370 200" />
      <path {...L} d="M302 60 L382 196" />
      <path {...A(P.aurora, 0.7)} d="M288 66 L294 76 M302 60 L308 70" />
    </>
  );
}

/**
 * Rouleau vu de trois quarts.
 * `inverted` : riz à l'extérieur et algue à l'intérieur — c'est ainsi que la
 * carte du restaurant décrit les rouleaux californiens.
 */
function MakiRoll({ cx, cy, inverted = false }: { cx: number; cy: number; inverted?: boolean }) {
  const rx = 36;
  const ry = 14;
  const h = 30;
  const grains = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return { x: cx + (rx - 4) * Math.cos(a), y: cy + (ry - 1.8) * Math.sin(a), rot: (k * 30) % 180 };
  });

  return (
    <g>
      <path
        {...L}
        fill={inverted ? P.rice : P.nori}
        d={`M${cx - rx} ${cy} L${cx - rx} ${cy + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + h} L${cx + rx} ${cy} Z`}
      />
      {inverted ? (
        // Sésame sur le riz extérieur
        [
          [-24, 16], [-12, 24], [2, 18], [16, 26], [26, 16], [-28, 32], [-6, 36], [10, 38], [24, 32], [-18, 42],
        ].map(([dx, dy], i) => (
          <ellipse key={i} {...D} strokeOpacity={0.7} cx={cx + dx} cy={cy + dy} rx={1.6} ry={0.8} transform={`rotate(${i * 37} ${cx + dx} ${cy + dy})`} />
        ))
      ) : (
        <path {...D} strokeOpacity={0.22} d={`M${cx - 20} ${cy + 12} L${cx - 20} ${cy + h + 8} M${cx + 4} ${cy + 14} L${cx + 4} ${cy + h + 12} M${cx + 24} ${cy + 11} L${cx + 24} ${cy + h + 6}`} />
      )}
      <ellipse {...L} fill={P.rice} cx={cx} cy={cy} rx={rx} ry={ry} />
      {inverted ? (
        <ellipse {...L} fill={P.nori} cx={cx} cy={cy} rx={rx - 14} ry={ry - 5.5} />
      ) : (
        <ellipse {...D} cx={cx} cy={cy} rx={rx - 8} ry={ry - 3.5} />
      )}
      {grains.map((g, i) => (
        <ellipse key={i} {...D} strokeOpacity={0.35} cx={g.x} cy={g.y} rx={1.8} ry={0.9} transform={`rotate(${g.rot} ${g.x} ${g.y})`} />
      ))}
      {/* Garniture */}
      <ellipse {...A(P.ember)} fill={P.tEmber} cx={cx - 5} cy={cy} rx={9} ry={4.2} />
      <ellipse {...A(P.jade)} fill={P.tJade} cx={cx + 8} cy={cy + 1} rx={5} ry={3} />
    </g>
  );
}

function Maki() {
  return (
    <>
      <Shadow cx={200} cy={252} rx={170} ry={9} />
      {/* Plateau en ardoise, en perspective */}
      <path {...L} fill={P.bg2} d="M72 168 L328 168 L364 244 L36 244 Z" />
      <path {...D} strokeOpacity={0.2} d="M60 206 L340 206" />
      <MakiRoll cx={262} cy={140} />
      <MakiRoll cx={146} cy={158} />
      <MakiRoll cx={214} cy={186} />
      {/* Gingembre */}
      <path {...A(P.plasma, 0.6)} fill={P.tPlasma} d="M300 224 C294 212 316 208 320 220 Z M312 226 C310 214 330 214 330 224 Z" />
    </>
  );
}

function Uramaki() {
  return (
    <>
      <Shadow cx={200} cy={252} rx={170} ry={9} />
      <path {...L} fill={P.bg2} d="M72 168 L328 168 L364 244 L36 244 Z" />
      <path {...D} strokeOpacity={0.2} d="M60 206 L340 206" />
      <MakiRoll cx={262} cy={140} inverted />
      <MakiRoll cx={146} cy={158} inverted />
      <MakiRoll cx={214} cy={186} inverted />
      <path {...A(P.plasma, 0.6)} fill={P.tPlasma} d="M300 224 C294 212 316 208 320 220 Z M312 226 C310 214 330 214 330 224 Z" />
    </>
  );
}

function Wok() {
  return (
    <>
      {/* Brûleur */}
      <Flame x={158} y={246} h={20} />
      <Flame x={184} y={248} h={26} delay={200} />
      <Flame x={212} y={248} h={24} delay={420} />
      <Flame x={238} y={246} h={18} delay={120} />
      <path {...D} d="M130 250 L270 250" />

      {/* Poignée */}
      <path {...L} fill={P.bg2} d="M296 156 L372 138 C384 136 386 150 374 152 L300 170 Z" />
      <path {...D} d="M346 146 L350 158 M356 143 L360 155" />

      {/* Cuve */}
      <path {...L} fill={P.bg2} d="M80 150 C94 226 286 226 300 150 Z" />
      <path {...D} strokeOpacity={0.3} d="M102 176 C136 206 244 206 278 176" />
      <ellipse {...L} fill={P.bg} cx={190} cy={150} rx={110} ry={23} />

      {/* Nouilles et légumes dans le wok */}
      <path {...L} d="M108 152 C126 140 146 160 168 148 C188 138 206 160 228 148 C246 138 260 156 274 150" />
      <path {...D} d="M114 158 C132 148 150 166 172 156 C194 146 210 166 232 156 C248 150 262 162 270 158" />
      <path {...D} d="M120 146 C140 136 156 152 176 142 C196 132 214 150 236 140 C252 134 262 146 268 144" />
      <rect {...A(P.jade)} fill={P.tJade} x={136} y={140} width={14} height={7} rx={2} transform="rotate(-18 143 143)" />
      <rect {...A(P.saffron)} fill={P.tSaffron} x={244} y={150} width={12} height={6} rx={2} transform="rotate(22 250 153)" />
      <circle {...A(P.ember)} fill={P.tEmber} cx={184} cy={160} r={4} />
      <rect {...A(P.jade)} fill={P.tJade} x={210} y={138} width={10} height={6} rx={2} transform="rotate(12 215 141)" />

      {/* Baguettes qui soulèvent les nouilles */}
      <path {...L} d="M168 44 L206 100" />
      <path {...L} d="M186 40 L222 98" />
      {/* Brins de nouilles, de largeurs et d'ondulations variées */}
      {[
        [198, 100, 1],
        [203, 100, -1],
        [208, 99, 1],
        [213, 99, -1],
        [218, 99, 1],
        [223, 98, -1],
        [227, 98, 1],
      ].map(([x, y, dir], i) => (
        <path
          key={i}
          {...(i % 2 === 0 ? A(P.saffron, 0.85) : L)}
          strokeWidth={i % 2 === 0 ? 1.6 : 1.1}
          d={`M${x} ${y} C${x - 7 * dir} ${y + 12} ${x + 7 * dir} ${y + 22} ${x} ${y + 34} C${x - 6 * dir} ${y + 44} ${x + 6 * dir} ${y + 50} ${x - 2 * dir} ${y + 58}`}
        />
      ))}

      <Steam x={116} y={140} h={58} />
      <Steam x={284} y={142} h={50} delay={900} />
    </>
  );
}

function Riz() {
  const grains = spread(200, 148, 74, 48, 46);
  return (
    <>
      <Shadow cx={200} cy={246} rx={110} ry={8} />
      {/* Baguettes posées devant */}
      <path {...L} d="M64 262 L300 248" />
      <path {...L} d="M68 270 L304 256" />

      {/* Bol */}
      <path {...L} fill={P.bg2} d="M108 150 C112 206 150 232 200 232 C250 232 288 206 292 150 Z" />
      <path {...D} d="M170 232 L174 242 L226 242 L230 232" />
      <path {...A(P.aurora, 0.5)} d="M122 180 C150 196 250 196 278 180" />

      {/* Dôme de riz */}
      <path {...L} fill={P.rice} d="M118 150 C128 112 170 94 200 94 C232 94 272 112 282 150 Z" />
      {grains.map((g, i) => (
        <ellipse key={i} {...D} strokeOpacity={0.45} cx={g.x} cy={g.y} rx={2.6} ry={1.1} transform={`rotate(${g.rot} ${g.x} ${g.y})`} />
      ))}
      <circle {...A(P.jade)} fill={P.tJade} cx={172} cy={126} r={3.4} />
      <circle {...A(P.jade)} fill={P.tJade} cx={236} cy={134} r={3.4} />
      <circle {...A(P.jade)} fill={P.tJade} cx={206} cy={112} r={3} />
      <rect {...A(P.saffron)} fill={P.tSaffron} x={216} y={120} width={11} height={7} rx={2} transform="rotate(-14 221 123)" />
      <rect {...A(P.saffron)} fill={P.tSaffron} x={150} y={136} width={10} height={6} rx={2} transform="rotate(20 155 139)" />

      {/* Bord avant du bol, devant le riz */}
      <path {...L} d="M108 150 A92 18 0 0 0 292 150" />

      <Steam x={176} y={90} h={54} />
      <Steam x={228} y={92} h={48} delay={1200} />
    </>
  );
}

function Cube({ x, y, rot = -6 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect {...L} fill={P.tEmber} x={-15} y={-13} width={30} height={26} rx={6} />
      <path {...A(P.bg, 0.9)} strokeWidth={2.2} className="ds d2" d="M-8 -9 L-2 9 M2 -10 L8 8" />
    </g>
  );
}

function Grill() {
  const bars = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    return { x1: 86 + 228 * t, x2: 48 + 304 * t };
  });
  const along = (x1: number, y1: number, x2: number, y2: number, t: number) => ({
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  });

  return (
    <>
      {/* Braises sous la grille */}
      <ellipse cx={200} cy={216} rx={132} ry={22} fill={P.ember} opacity={0.12} className="df" />
      <Flame x={112} y={252} h={16} />
      <Flame x={168} y={254} h={22} delay={260} />
      <Flame x={232} y={254} h={20} delay={520} />
      <Flame x={290} y={252} h={15} delay={140} />

      {/* Grille */}
      <path {...L} d="M86 176 L314 176 L352 236 L48 236 Z" />
      {bars.map((b, i) => (
        <path key={i} {...D} d={`M${b.x1} 176 L${b.x2} 236`} />
      ))}

      {/* Brochette arrière */}
      <path {...L} d="M64 190 L336 162" />
      <circle {...L} cx={58} cy={191} r={6} />
      {[0.2, 0.36, 0.52, 0.68, 0.84].map((t) => {
        const p = along(64, 190, 336, 162, t);
        return <Cube key={`a${t}`} x={p.x} y={p.y} />;
      })}

      {/* Brochette avant */}
      <path {...L} d="M92 222 L360 194" />
      <circle {...L} cx={86} cy={223} r={6} />
      {[0.22, 0.38, 0.54, 0.7, 0.86].map((t) => {
        const p = along(92, 222, 360, 194, t);
        return <Cube key={`b${t}`} x={p.x} y={p.y} rot={-7} />;
      })}

      <Steam x={150} y={140} h={48} />
      <Steam x={220} y={134} h={52} delay={700} />
      <Steam x={290} y={128} h={44} delay={1400} />
    </>
  );
}

function Drumstick({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* Os */}
      <path {...L} fill={P.rice} d="M4 26 L-10 44 L-4 48 L10 30 Z" />
      <circle {...L} fill={P.rice} cx={-12} cy={46} r={5} />
      <circle {...L} fill={P.rice} cx={-6} cy={51} r={5} />
      {/* Chair */}
      <path {...L} fill={P.tSaffron} d="M-6 -2 C-8 -30 30 -48 56 -34 C78 -22 72 6 48 14 C32 20 18 22 10 30 C4 34 -4 30 -2 22 C0 14 -4 8 -6 -2 Z" />
      <path {...A(P.ember, 0.55)} d="M8 -26 L22 4 M24 -34 L40 0 M42 -34 L56 -4" />
      <path {...D} d="M4 -10 C14 -18 30 -20 44 -14" />
    </g>
  );
}

function Volaille() {
  return (
    <>
      <Shadow cx={200} cy={236} rx={156} ry={14} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={206} rx={150} ry={40} />
      <ellipse {...D} cx={200} cy={206} rx={118} ry={30} />
      <Drumstick x={152} y={190} rot={-18} />
      <Drumstick x={236} y={200} rot={16} />
      {/* Brin d'herbe */}
      <path {...A(P.jade)} d="M300 214 C312 202 324 196 340 194" />
      <ellipse {...A(P.jade)} fill={P.tJade} cx={314} cy={202} rx={7} ry={3} transform="rotate(-40 314 202)" />
      <ellipse {...A(P.jade)} fill={P.tJade} cx={328} cy={197} rx={7} ry={3} transform="rotate(-10 328 197)" />
      <Steam x={180} y={140} h={46} />
      <Steam x={250} y={146} h={40} delay={900} />
    </>
  );
}

function Mijote() {
  return (
    <>
      <Shadow cx={200} cy={250} rx={130} ry={10} />
      {/* Cocotte */}
      <path {...L} d="M104 158 C86 156 84 178 106 178" />
      <path {...L} d="M296 158 C314 156 316 178 294 178" />
      <path {...L} fill={P.bg2} d="M104 146 L112 222 C114 236 128 244 144 244 L256 244 C272 244 286 236 288 222 L296 146 Z" />
      <path {...A(P.aurora, 0.45)} d="M116 190 C150 200 250 200 284 190" />
      <ellipse {...L} fill={P.bg} cx={200} cy={146} rx={96} ry={18} />

      {/* Préparation en sauce */}
      <ellipse {...A(P.ember, 0.8)} fill={P.tEmber} cx={200} cy={148} rx={84} ry={13} />
      <path {...L} fill={P.tSaffron} d="M138 148 c4 -7 16 -7 18 0 c-2 6 -14 7 -18 0 z" />
      <path {...L} fill={P.tSaffron} d="M176 142 c5 -6 17 -5 19 1 c-3 6 -16 6 -19 -1 z" />
      <path {...L} fill={P.tJade} d="M164 153 c3 -4 10 -4 12 0 c-2 4 -10 4 -12 0 z" />

      {/* Couvercle entrouvert */}
      <g transform="rotate(-15 250 118)">
        <path {...L} fill={P.bg2} d="M170 118 C176 90 324 90 330 118 Z" />
        <ellipse {...L} fill={P.bg2} cx={250} cy={118} rx={80} ry={14} />
        <path {...L} fill={P.rice} d="M238 96 C238 84 262 84 262 96 Z" />
        <path {...D} d="M196 106 C222 98 278 98 304 106" />
      </g>

      <Steam x={124} y={136} h={60} />
      <Steam x={146} y={130} h={52} delay={800} />
      <Steam x={166} y={128} h={44} delay={1600} />
    </>
  );
}

function Pizza() {
  const cuts = [200, 245, 290, 115, 160].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: 200 + 114 * Math.cos(a), y: 178 + 48 * Math.sin(a) };
  });
  const toppings = [
    [150, 170],
    [178, 196],
    [120, 188],
    [214, 160],
    [236, 206],
    [168, 150],
    [226, 156],
  ];

  return (
    <>
      <Shadow cx={200} cy={236} rx={160} ry={14} />
      {/* Pelle à pizza */}
      <path {...L} fill={P.bg2} d="M60 212 L10 244 L18 254 L70 222 Z" />
      <ellipse {...L} fill={P.bg2} cx={200} cy={186} rx={150} ry={62} />

      {/* Pizza, part retirée */}
      <path {...L} fill={P.tSaffron} d="M200 178 L310.9 205 A128 54 0 1 1 310.9 151 Z" />
      <path {...A(P.saffron, 0.5)} d="M200 178 L300.5 202 A116 48 0 1 1 300.5 154" />
      {cuts.map((c, i) => (
        <path key={i} {...D} d={`M200 178 L${c.x} ${c.y}`} />
      ))}
      {toppings.map(([x, y], i) => (
        <ellipse key={i} {...A(P.ember, 0.8)} fill={P.tEmber} cx={x} cy={y} rx={9} ry={4.5} />
      ))}
      <path {...A(P.jade)} fill={P.tJade} d="M196 196 c4 -6 12 -6 14 0 c-4 4 -10 4 -14 0 z M132 160 c4 -5 11 -5 13 0 c-4 4 -9 4 -13 0 z" />

      {/* Part soulevée et fils de fromage */}
      <path {...A(P.saffron, 0.7)} d="M234 152 C226 160 238 166 226 171 C218 175 210 176 204 178" />
      <path {...A(P.saffron, 0.5)} d="M244 156 C238 166 250 172 238 180 C230 186 220 186 214 188" />
      <path {...L} fill={P.tSaffron} d="M226 148 L336.9 175 A128 54 0 0 0 336.9 121 Z" />
      <path {...A(P.saffron, 0.5)} d="M324 170 A116 48 0 0 0 324 126" />
      <ellipse {...A(P.ember, 0.8)} fill={P.tEmber} cx={296} cy={146} rx={8} ry={4} />
      <ellipse {...A(P.ember, 0.8)} fill={P.tEmber} cx={320} cy={156} rx={7} ry={3.5} />
    </>
  );
}

function Pates() {
  const loops = [
    { rx: 58, ry: 18, rot: -6, dx: 0, dy: 0, style: L },
    { rx: 50, ry: 16, rot: 8, dx: -6, dy: -6, style: D },
    { rx: 44, ry: 14, rot: -12, dx: 6, dy: -12, style: L },
    { rx: 36, ry: 12, rot: 4, dx: -2, dy: -18, style: D },
    { rx: 62, ry: 16, rot: 3, dx: 4, dy: 6, style: D },
    { rx: 28, ry: 9, rot: -8, dx: 2, dy: -24, style: L },
  ];
  return (
    <>
      <Shadow cx={200} cy={240} rx={150} ry={12} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={200} rx={140} ry={40} />
      <ellipse {...D} cx={200} cy={202} rx={94} ry={26} />

      <ellipse fill={P.tSaffron} cx={200} cy={188} rx={66} ry={22} className="df" />
      {loops.map((l, i) => (
        <ellipse
          key={i}
          {...l.style}
          cx={200 + l.dx}
          cy={184 + l.dy}
          rx={l.rx}
          ry={l.ry}
          transform={`rotate(${l.rot} ${200 + l.dx} ${184 + l.dy})`}
        />
      ))}
      <circle {...A(P.ember)} fill={P.tEmber} cx={170} cy={188} r={4} />
      <circle {...A(P.ember)} fill={P.tEmber} cx={232} cy={194} r={3.5} />
      <circle {...A(P.ember)} fill={P.tEmber} cx={214} cy={172} r={3} />

      {/* Fourchette plantée, pâtes enroulées */}
      <path {...L} fill={P.bg2} d="M216 150 L296 58 C300 52 308 56 304 62 L224 154 Z" />
      <path {...A(P.saffron, 0.85)} d="M190 160 C198 148 238 148 242 160 C238 172 196 172 192 162 C198 154 232 154 236 162" />
      <path {...A(P.jade)} fill={P.tJade} d="M160 168 c6 -8 18 -6 20 2 c-6 5 -16 5 -20 -2 z" />

      <Steam x={180} y={146} h={50} />
      <Steam x={250} y={150} h={42} delay={1000} />
    </>
  );
}

function Shrimp({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path {...L} fill={P.tEmber} d="M0 0 L-12 8 L-6 12 L2 6 L6 14 L10 4 Z" />
      <path {...L} fill={P.tEmber} d="M2 0 C-2 -30 30 -46 54 -30 C60 -26 58 -18 52 -18 C34 -28 16 -18 14 2 Z" />
      <path {...A(P.ember, 0.6)} d="M8 -12 C13 -10 17 -6 17 0 M14 -24 C19 -20 22 -15 21 -10 M26 -32 C29 -26 30 -21 28 -16 M40 -34 C42 -28 41 -24 38 -20" />
      <circle cx={50} cy={-26} r={1.6} fill={P.line} className="df" />
      <path {...D} d="M54 -30 C70 -42 86 -36 98 -46 M52 -24 C70 -30 84 -22 98 -30" />
    </g>
  );
}

function Shell({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path {...L} fill={P.bg2} d="M0 0 C-30 -4 -38 -26 -20 -38 C-4 -48 26 -44 34 -26 C40 -12 26 2 0 0 Z" />
      <path {...D} d="M0 0 C-14 -10 -22 -22 -20 -34 M0 0 C-4 -16 -2 -30 4 -42 M0 0 C8 -12 16 -24 26 -32 M0 0 C14 -6 24 -12 32 -20" />
      <path {...A(P.plasma, 0.7)} fill={P.tPlasma} d="M-4 -8 C-16 -14 -16 -28 -4 -32 C10 -34 20 -24 14 -14 C10 -8 4 -6 -4 -8 Z" />
    </g>
  );
}

function FruitsDeMer() {
  return (
    <>
      <Shadow cx={200} cy={238} rx={164} ry={12} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={204} rx={158} ry={42} />
      <ellipse {...D} cx={200} cy={206} rx={128} ry={31} />
      <Shell x={124} y={206} rot={-10} />
      <Shell x={292} y={210} rot={18} />
      <Shrimp x={168} y={196} rot={0} />
      <Shrimp x={214} y={222} rot={-8} />
    </>
  );
}

function Poisson() {
  const scales: Array<[number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      scales.push([152 + col * 15 + (row % 2) * 7, 178 + row * 11]);
    }
  }
  return (
    <>
      <Shadow cx={200} cy={240} rx={158} ry={12} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={206} rx={152} ry={36} />
      {/* Nageoires */}
      <path {...L} fill={P.bg2} d="M168 160 C186 136 232 138 250 162 Z" />
      <path {...L} fill={P.bg2} d="M190 220 C200 236 222 236 232 220 Z" />
      <path {...L} fill={P.tAurora} d="M290 190 L334 160 L326 190 L334 220 Z" />
      <path {...D} d="M296 190 L326 170 M296 190 L326 190 M296 190 L326 210" />
      {/* Corps */}
      <path {...L} fill={P.tAurora} d="M86 190 C116 150 230 142 294 180 C302 186 302 194 294 200 C230 230 116 230 86 190 Z" />
      {scales.map(([sx, sy], i) => (
        <path key={i} {...D} strokeOpacity={0.32} d={`M${sx} ${sy} a6 5 0 0 1 11 0`} />
      ))}
      <path {...D} d="M132 166 C124 182 126 200 134 214" />
      <circle {...L} fill={P.bg} cx={110} cy={184} r={5} />
      <circle cx={111} cy={183} r={1.6} fill={P.line} className="df" />
      <path {...A(P.aurora, 0.6)} d="M150 172 C200 160 250 164 288 182" />
      {/* Herbes */}
      <path {...A(P.jade)} d="M70 228 C90 220 104 222 118 214" />
      <ellipse {...A(P.jade)} fill={P.tJade} cx={86} cy={222} rx={6} ry={2.6} transform="rotate(-20 86 222)" />
      <ellipse {...A(P.jade)} fill={P.tJade} cx={104} cy={218} rx={6} ry={2.6} transform="rotate(-30 104 218)" />
    </>
  );
}

function Patisserie() {
  // Part de gâteau en perspective : pointe, deux coins arrière, hauteur 56.
  const tip = [118, 170];
  const backR = [252, 122];
  const backL = [302, 150];
  const h = 56;
  const band = (k: number) => `M${tip[0]} ${tip[1] + k} L${backL[0]} ${backL[1] + k}`;

  return (
    <>
      <Shadow cx={200} cy={244} rx={132} ry={10} />
      <ellipse {...L} fill={P.bg2} cx={210} cy={220} rx={128} ry={28} />
      <ellipse {...D} cx={210} cy={220} rx={98} ry={20} />

      {/* Face arrière (croûte) */}
      <path {...L} fill={P.tSaffron} d={`M${backR[0]} ${backR[1]} L${backL[0]} ${backL[1]} L${backL[0]} ${backL[1] + h} L${backR[0]} ${backR[1] + h} Z`} />
      {/* Face latérale, avec ses couches */}
      <path {...L} fill={P.tSaffron} d={`M${tip[0]} ${tip[1]} L${backL[0]} ${backL[1]} L${backL[0]} ${backL[1] + h} L${tip[0]} ${tip[1] + h} Z`} />
      <path fill={P.rice} className="df" d={`M${tip[0]} ${tip[1] + 16} L${backL[0]} ${backL[1] + 16} L${backL[0]} ${backL[1] + 24} L${tip[0]} ${tip[1] + 24} Z`} />
      <path fill={P.rice} className="df" d={`M${tip[0]} ${tip[1] + 36} L${backL[0]} ${backL[1] + 36} L${backL[0]} ${backL[1] + 43} L${tip[0]} ${tip[1] + 43} Z`} />
      <path {...D} d={`${band(16)} ${band(24)} ${band(36)} ${band(43)}`} />
      {/* Face supérieure (nappage) */}
      <path {...L} fill={P.rice} d={`M${tip[0]} ${tip[1]} L${backR[0]} ${backR[1]} L${backL[0]} ${backL[1]} Z`} />
      <path {...A(P.plasma, 0.55)} d="M150 160 C170 150 186 158 204 148 C220 140 236 146 262 136" />

      {/* Décor */}
      <path {...A(P.saffron, 0.8)} fill={P.bg2} d="M212 140 c-10 -1 -10 -14 0 -14 c10 0 12 10 2 12 c-6 0 -6 -6 -1 -6" />
      <circle {...A(P.ember)} fill={P.tEmber} cx={246} cy={134} r={9} />
      <path {...D} strokeOpacity={0.7} d="M242 130 a4 4 0 0 1 5 -2" />
      <path {...A(P.jade)} fill={P.tJade} d="M252 124 c4 -6 12 -6 12 0 c-4 3 -9 3 -12 0 z" />

      {/* Fourchette à dessert */}
      <path {...L} fill={P.bg2} d="M300 236 L370 216 L372 222 L302 242 Z" />
      <path {...L} d="M300 236 L284 236 M300 239 L284 240 M301 242 L286 244" />
    </>
  );
}

function Scoop({ cx, cy, r, fill, stroke }: { cx: number; cy: number; r: number; fill: string; stroke: string }) {
  const q = r / 2;
  const d =
    `M${cx - r} ${cy} A${r} ${r * 0.92} 0 0 1 ${cx + r} ${cy} ` +
    `q ${-q / 2} ${q * 0.6} ${-q} 0 q ${-q / 2} ${q * 0.6} ${-q} 0 q ${-q / 2} ${q * 0.6} ${-q} 0 q ${-q / 2} ${q * 0.6} ${-q} 0 Z`;
  return (
    <g>
      <path {...L} fill={fill} d={d} />
      <path {...A(stroke, 0.5)} d={`M${cx - r * 0.55} ${cy - r * 0.5} a${r * 0.5} ${r * 0.45} 0 0 1 ${r * 0.45} ${-r * 0.28}`} />
    </g>
  );
}

function Glace() {
  return (
    <>
      <Shadow cx={200} cy={256} rx={70} ry={7} />
      {/* Coupe */}
      <ellipse {...L} fill={P.bg2} cx={200} cy={252} rx={40} ry={7} />
      <path {...L} d="M196 214 L194 250 M204 214 L206 250" />
      <path {...L} fill={P.bg2} d="M134 150 C138 196 168 216 200 216 C232 216 262 196 266 150 Z" />
      <path {...A(P.aurora, 0.45)} d="M148 168 C160 196 180 206 200 206" />

      {/* Boules */}
      <Scoop cx={172} cy={148} r={31} fill={P.tSaffron} stroke={P.saffron} />
      <Scoop cx={228} cy={148} r={31} fill={P.tJade} stroke={P.jade} />
      <Scoop cx={200} cy={112} r={31} fill={P.tPlasma} stroke={P.plasma} />
      <ellipse {...D} cx={200} cy={150} rx={66} ry={10} />

      {/* Coulure */}
      <path {...A(P.jade, 0.8)} d="M250 158 C254 170 248 178 252 188" />
      <circle {...A(P.jade, 0.8)} fill={P.tJade} cx={252} cy={191} r={2.5} />

      {/* Gaufrette */}
      <g transform="rotate(26 250 84)">
        <rect {...L} fill={P.tSaffron} x={242} y={52} width={14} height={52} rx={3} />
        <path {...D} d="M242 64 L256 64 M242 76 L256 76 M242 88 L256 88 M249 52 L249 104" />
      </g>
    </>
  );
}

function Fruits() {
  const segments = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: 140 + 38 * Math.cos(a), y: 196 + 23 * Math.sin(a) };
  });
  const grapes = [
    [98, 150],
    [116, 148],
    [134, 150],
    [106, 164],
    [124, 164],
    [142, 164],
    [114, 178],
    [132, 178],
    [122, 191],
  ];
  return (
    <>
      <Shadow cx={200} cy={244} rx={160} ry={10} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={216} rx={156} ry={32} />

      {/* Raisins */}
      <path {...L} d="M118 138 C120 128 126 122 136 118" />
      {grapes.map(([x, y], i) => (
        <g key={i}>
          <circle {...L} fill={P.tPlasma} cx={x} cy={y} r={9} />
          <path {...A(P.plasma, 0.6)} d={`M${x - 4} ${y - 3} a4 4 0 0 1 4 -3`} />
        </g>
      ))}

      {/* Tranche de melon */}
      <path {...L} fill={P.tJade} d="M206 176 C226 118 334 114 354 176 Z" />
      <path {...A(P.ember, 0.7)} fill={P.tEmber} d="M218 176 C236 130 324 128 342 176 Z" />
      {[
        [252, 158],
        [268, 152],
        [284, 150],
        [300, 152],
        [316, 158],
      ].map(([x, y], i) => (
        <ellipse key={i} {...D} fill={P.bg} cx={x} cy={y} rx={2.4} ry={1.2} transform={`rotate(${-20 + i * 10} ${x} ${y})`} />
      ))}

      {/* Rondelle d'agrume */}
      <ellipse {...L} fill={P.tSaffron} cx={140} cy={196} rx={46} ry={29} />
      <ellipse {...A(P.saffron, 0.6)} cx={140} cy={196} rx={40} ry={25} />
      {segments.map((p, i) => (
        <path key={i} {...A(P.saffron, 0.55)} d={`M140 196 L${p.x} ${p.y}`} />
      ))}
      <ellipse cx={140} cy={196} rx={4} ry={2.5} fill={P.line} opacity={0.6} className="df" />
    </>
  );
}

function Leaf({ x, y, rot, len }: { x: number; y: number; rot: number; len: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        {...L}
        fill={P.tJade}
        d={`M0 0 C${len * 0.3} ${-len * 0.34} ${len * 0.72} ${-len * 0.3} ${len} 0 C${len * 0.72} ${len * 0.3} ${len * 0.3} ${len * 0.34} 0 0 Z`}
      />
      <path {...A(P.jade, 0.55)} d={`M4 0 L${len - 6} 0`} />
    </g>
  );
}

function Salade() {
  return (
    <>
      <Shadow cx={200} cy={248} rx={120} ry={9} />
      {/* Bord arrière */}
      <path {...D} d="M96 150 A104 20 0 0 1 304 150" />
      {/* Feuilles */}
      <Leaf x={130} y={158} rot={-72} len={62} />
      <Leaf x={160} y={154} rot={-102} len={68} />
      <Leaf x={198} y={152} rot={-84} len={76} />
      <Leaf x={236} y={154} rot={-112} len={60} />
      <Leaf x={266} y={158} rot={-64} len={58} />
      <Leaf x={210} y={154} rot={-130} len={54} />
      {/* Tomates et concombre */}
      <ellipse {...L} fill={P.tEmber} cx={150} cy={146} rx={17} ry={9} />
      <ellipse {...A(P.ember, 0.6)} cx={150} cy={146} rx={10} ry={5} />
      <ellipse {...L} fill={P.tEmber} cx={256} cy={148} rx={16} ry={8.5} />
      <ellipse {...A(P.ember, 0.6)} cx={256} cy={148} rx={9} ry={4.6} />
      <ellipse {...L} fill={P.bg2} cx={206} cy={148} rx={13} ry={6.5} />
      <ellipse {...A(P.jade, 0.7)} cx={206} cy={148} rx={8} ry={4} />
      {/* Saladier, devant les feuilles */}
      <path {...L} fill={P.bg2} d="M96 150 C100 214 150 238 200 238 C250 238 300 214 304 150 A104 20 0 0 1 96 150 Z" />
      <path {...A(P.aurora, 0.4)} d="M112 186 C150 206 250 206 288 186" />
      <path {...L} d="M96 150 A104 20 0 0 0 304 150" />
    </>
  );
}

function Candy({ x, y, rot, fill, stroke }: { x: number; y: number; rot: number; fill: string; stroke: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path {...L} fill={fill} d="M-16 0 L-30 -10 L-28 0 L-30 10 Z M16 0 L30 -10 L28 0 L30 10 Z" />
      <ellipse {...L} fill={fill} cx={0} cy={0} rx={17} ry={11} />
      <path {...A(stroke, 0.6)} d="M-8 -6 C-2 -2 2 2 8 6 M-12 2 C-6 5 -2 8 2 9" />
    </g>
  );
}

function Swirl({ x, y, r, fill, stroke }: { x: number; y: number; r: number; fill: string; stroke: string }) {
  return (
    <g>
      <ellipse {...L} fill={fill} cx={x} cy={y} rx={r} ry={r * 0.62} />
      <path
        {...A(stroke, 0.7)}
        d={`M${x} ${y} c3 -2 6 0 5 3 c-1 4 -8 5 -11 1 c-3 -5 2 -10 8 -10 c7 0 12 6 9 12`}
      />
    </g>
  );
}

function Confiserie() {
  return (
    <>
      <Shadow cx={200} cy={244} rx={140} ry={9} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={212} rx={134} ry={32} />
      <ellipse {...D} cx={200} cy={214} rx={104} ry={23} />
      <Swirl x={200} y={184} r={22} fill={P.tSaffron} stroke={P.saffron} />
      <Candy x={146} y={200} rot={-12} fill={P.tEmber} stroke={P.ember} />
      <Candy x={254} y={206} rot={16} fill={P.tPlasma} stroke={P.plasma} />
      <Swirl x={298} y={192} r={15} fill={P.tJade} stroke={P.jade} />
      <Candy x={200} y={226} rot={-4} fill={P.tJade} stroke={P.jade} />
    </>
  );
}

function Boisson() {
  return (
    <>
      <Shadow cx={200} cy={250} rx={80} ry={8} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={244} rx={72} ry={12} />
      {/* Liquide */}
      <path fill={P.tAurora} className="df" d="M152 96 L164 234 C165 242 235 242 236 234 L248 96 Z" />
      <ellipse {...A(P.aurora, 0.8)} fill={P.tAurora} cx={200} cy={96} rx={48} ry={7.5} />
      {/* Glaçons */}
      <rect {...L} fill={P.bg2} fillOpacity={0.8} x={168} y={104} width={26} height={24} rx={5} transform="rotate(18 181 116)" />
      <rect {...L} fill={P.bg2} fillOpacity={0.8} x={204} y={100} width={26} height={24} rx={5} transform="rotate(-14 217 112)" />
      <rect {...D} fill={P.bg2} fillOpacity={0.6} x={186} y={140} width={24} height={22} rx={5} transform="rotate(34 198 151)" />
      {/* Paille */}
      <path {...A(P.ember, 0.85)} fill={P.tEmber} d="M218 44 L204 206 L212 207 L226 45 Z" />
      <path {...A(P.ember, 0.85)} d="M222 44 L238 22 M226 45 L242 24" />
      {/* Bulles */}
      {[
        [178, 190, 2.4],
        [220, 176, 2],
        [188, 214, 1.8],
        [226, 206, 2.6],
        [172, 164, 1.6],
      ].map(([x, y, r], i) => (
        <circle key={i} {...D} strokeOpacity={0.6} cx={x} cy={y} r={r} />
      ))}
      {/* Verre */}
      <path {...L} d="M150 70 L164 236 C165 244 235 244 236 236 L250 70" />
      <ellipse {...L} cx={200} cy={70} rx={50} ry={8} />
      <path {...D} strokeOpacity={0.3} d="M160 90 L170 220" />
    </>
  );
}

function BoissonChaude() {
  return (
    <>
      <Shadow cx={200} cy={246} rx={116} ry={9} />
      <ellipse {...L} fill={P.bg2} cx={200} cy={222} rx={112} ry={24} />
      <ellipse {...D} cx={200} cy={220} rx={70} ry={13} />
      {/* Cuillère */}
      <path {...L} d="M104 232 L50 248" />
      <ellipse {...L} fill={P.bg2} cx={114} cy={229} rx={11} ry={5} transform="rotate(-16 114 229)" />
      {/* Anse */}
      <path {...L} d="M258 164 C288 160 294 192 262 198" />
      <path {...D} d="M258 172 C276 170 280 186 260 190" />
      {/* Tasse */}
      <path {...L} fill={P.bg2} d="M140 150 C142 198 170 216 200 216 C230 216 258 198 260 150 Z" />
      <path {...A(P.aurora, 0.4)} d="M152 176 C176 196 224 196 248 176" />
      <ellipse {...L} fill={P.bg} cx={200} cy={150} rx={60} ry={13} />
      <ellipse {...A(P.ember, 0.6)} fill={P.tEmber} cx={200} cy={153} rx={51} ry={9.5} />
      <path {...D} strokeOpacity={0.5} d="M178 152 C188 148 206 148 220 154" />

      <Steam x={180} y={140} h={66} />
      <Steam x={200} y={136} h={74} delay={700} />
      <Steam x={220} y={140} h={62} delay={1400} />
    </>
  );
}

/* ══════════════════════════════ Référentiel ══════════════════════════════ */

export const ART: Record<IllustrationKind, () => ReactNode> = {
  salade: Salade,
  sushi: Sushi,
  maki: Maki,
  uramaki: Uramaki,
  wok: Wok,
  riz: Riz,
  grill: Grill,
  volaille: Volaille,
  mijote: Mijote,
  pizza: Pizza,
  pates: Pates,
  'fruits-de-mer': FruitsDeMer,
  poisson: Poisson,
  patisserie: Patisserie,
  glace: Glace,
  fruits: Fruits,
  confiserie: Confiserie,
  boisson: Boisson,
  'boisson-chaude': BoissonChaude,
};

export const KIND_LABEL: Record<IllustrationKind, string> = {
  salade: 'salades et crudités',
  sushi: 'sushi',
  maki: 'maki',
  uramaki: 'rouleaux californiens',
  wok: 'nouilles sautées au wok',
  riz: 'riz sauté',
  grill: 'brochettes au grill',
  volaille: 'volaille',
  mijote: 'plat mijoté',
  pizza: 'pizza',
  pates: 'pâtes',
  'fruits-de-mer': 'fruits de mer',
  poisson: 'poisson',
  patisserie: 'pâtisserie',
  glace: 'glaces et sorbets',
  fruits: 'fruits frais',
  confiserie: 'confiseries',
  boisson: 'boisson fraîche',
  'boisson-chaude': 'boisson chaude',
};

export type Note = {
  /** Point désigné sur le dessin */
  at: [number, number];
  /** Coude du filet ; le libellé part de là */
  to: [number, number];
  /** Sens du libellé depuis le coude */
  side?: 'left' | 'right';
  label: string;
};

/**
 * Annotations. Elles ne nomment que ce qui figure dans data/menu.ts (noms de
 * plats, descriptions, allergènes) — jamais un ingrédient supposé.
 */
export const NOTES: Record<IllustrationKind, Note[]> = {
  salade: [
    { at: [198, 112], to: [150, 60], side: 'left', label: 'SALADES' },
    { at: [256, 148], to: [300, 112], label: 'CRUDITÉS' },
  ],
  sushi: [
    { at: [160, 180], to: [110, 124], side: 'left', label: 'POISSON' },
    { at: [196, 212], to: [150, 272], side: 'left', label: 'RIZ VINAIGRÉ' },
  ],
  maki: [
    { at: [110, 176], to: [70, 120], side: 'left', label: 'NORI' },
    { at: [214, 186], to: [250, 104], label: 'GARNITURE' },
  ],
  uramaki: [
    { at: [118, 170], to: [140, 108], side: 'left', label: 'RIZ EXTÉRIEUR' },
    { at: [228, 204], to: [280, 108], label: 'SÉSAME' },
  ],
  wok: [
    { at: [214, 124], to: [270, 76], label: 'NOUILLES' },
    { at: [143, 143], to: [80, 104], side: 'left', label: 'LÉGUMES' },
    { at: [184, 236], to: [300, 272], label: 'CUISSON VIVE' },
  ],
  riz: [
    { at: [182, 118], to: [120, 64], side: 'left', label: 'RIZ SAUTÉ' },
    { at: [221, 123], to: [290, 88], label: 'ŒUF' },
  ],
  grill: [
    { at: [200, 176], to: [240, 108], label: 'BROCHETTES' },
    { at: [140, 214], to: [80, 272], side: 'left', label: 'HALAL' },
  ],
  volaille: [{ at: [170, 162], to: [120, 108], side: 'left', label: 'VOLAILLE' }],
  mijote: [
    { at: [236, 150], to: [300, 204], label: 'EN SAUCE' },
    { at: [124, 104], to: [80, 56], label: 'CUISSON LENTE' },
  ],
  pizza: [
    { at: [120, 188], to: [70, 120], side: 'left', label: 'PIZZA' },
    { at: [300, 140], to: [300, 70], label: 'SUR PLACE' },
  ],
  pates: [
    { at: [160, 184], to: [100, 128], side: 'left', label: 'PÂTES' },
    { at: [232, 194], to: [300, 254], label: 'SAUCES' },
  ],
  'fruits-de-mer': [
    { at: [196, 170], to: [220, 110], label: 'CRUSTACÉS' },
    { at: [124, 190], to: [110, 128], side: 'left', label: 'COQUILLAGES' },
  ],
  poisson: [{ at: [200, 176], to: [240, 110], label: 'POISSON' }],
  patisserie: [
    { at: [170, 200], to: [100, 262], side: 'left', label: 'GÂTEAU' },
    { at: [246, 134], to: [300, 80], label: 'PÂTISSERIE' },
  ],
  glace: [
    { at: [200, 96], to: [140, 50], side: 'left', label: 'GLACES' },
    { at: [236, 142], to: [300, 118], label: 'SORBETS' },
  ],
  fruits: [
    { at: [140, 196], to: [120, 262], side: 'left', label: 'FRUITS FRAIS' },
    { at: [290, 160], to: [310, 96], label: 'DÉCOUPÉS' },
  ],
  confiserie: [{ at: [200, 180], to: [240, 120], label: 'CONFISERIES' }],
  boisson: [{ at: [236, 120], to: [290, 88], label: 'SANS ALCOOL' }],
  'boisson-chaude': [{ at: [200, 152], to: [290, 110], label: 'CAFÉ · THÉ' }],
};

export { P as PALETTE };
