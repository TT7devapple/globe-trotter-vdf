/**
 * CARTE DU MONDE EN POINTS
 * ==========================================================================
 * La carte n'est pas une image : elle est générée à partir d'un masque
 * terre/mer très basse résolution (cellules de 5°) puis projetée en points.
 *
 * Pourquoi ce choix :
 *  - aucune image à charger (quelques kilo-octets de JavaScript au lieu de
 *    plusieurs centaines de kilo-octets de PNG ou de GeoJSON) ;
 *  - le rendu « matrice de points » sert directement l'esthétique d'écran de
 *    navigation, sans avoir à styliser une carte existante ;
 *  - aucune question de licence sur un fond cartographique.
 *
 * Le tracé est volontairement approximatif : c'est une signature graphique,
 * pas un outil de navigation.
 */

/** Chaque entrée : [indice de ligne, colonne de début, colonne de fin] inclus. */
const LAND_BANDS: Array<[number, number, number]> = [
  // Ligne 0 = 80° N, puis un pas de 5° vers le sud. Colonne 0 = 180° O, pas de 5°.
  [0, 16, 24], [0, 26, 32], [0, 39, 41], [0, 52, 68],
  [1, 14, 24], [1, 26, 33], [1, 48, 70],
  [2, 8, 25], [2, 27, 33], [2, 38, 71],
  [3, 4, 26], [3, 28, 33], [3, 34, 35], [3, 37, 71],
  [4, 4, 27], [4, 29, 32], [4, 35, 71],
  [5, 6, 27], [5, 33, 35], [5, 36, 71],
  [6, 11, 26], [6, 33, 35], [6, 36, 70],
  [7, 12, 26], [7, 35, 69],
  [8, 13, 25], [8, 34, 68],
  [9, 14, 24], [9, 33, 66],
  [10, 15, 23], [10, 32, 46], [10, 47, 64],
  [11, 16, 22], [11, 31, 47], [11, 48, 62],
  [12, 17, 21], [12, 30, 47], [12, 48, 61],
  [13, 18, 21], [13, 29, 46], [13, 49, 60],
  [14, 19, 22], [14, 28, 46], [14, 50, 61],
  [15, 21, 25], [15, 28, 46], [15, 54, 62],
  [16, 21, 28], [16, 29, 45], [16, 54, 63],
  [17, 21, 29], [17, 30, 44], [17, 55, 63],
  [18, 21, 29], [18, 30, 44], [18, 56, 64],
  [19, 21, 30], [19, 31, 43], [19, 58, 67],
  [20, 22, 30], [20, 32, 42], [20, 44, 45], [20, 57, 67],
  [21, 23, 30], [21, 32, 41], [21, 44, 45], [21, 56, 67],
  [22, 24, 29], [22, 33, 40], [22, 56, 66],
  [23, 24, 28], [23, 34, 38], [23, 57, 65], [23, 69, 70],
  [24, 25, 27], [24, 69, 71],
  [25, 25, 27], [25, 70, 71],
  [26, 25, 27],
  [27, 25, 26],
];

const COLS = 72;
const ROWS = 28;
/** Latitude du centre de la première ligne. */
const LAT_TOP = 80;
const STEP = 5;

/** Bornes de la projection, choisies pour cadrer les terres émergées. */
export const MAP_VIEW = { width: 1000, height: 460, latMax: 84, latMin: -56 };

export type MapDot = { x: number; y: number; row: number; col: number };

/** Projette une position géographique dans le repère de la carte. */
export function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * MAP_VIEW.width;
  const y =
    ((MAP_VIEW.latMax - lat) / (MAP_VIEW.latMax - MAP_VIEW.latMin)) * MAP_VIEW.height;
  return { x, y };
}

let cachedDots: MapDot[] | null = null;

/** Les points de terre de la carte, calculés une seule fois. */
export function landDots(): MapDot[] {
  if (cachedDots) return cachedDots;

  const grid: boolean[][] = Array.from({ length: ROWS }, () => new Array<boolean>(COLS).fill(false));
  for (const [row, start, end] of LAND_BANDS) {
    if (row < 0 || row >= ROWS) continue;
    for (let col = Math.max(0, start); col <= Math.min(COLS - 1, end); col += 1) {
      grid[row][col] = true;
    }
  }

  const dots: MapDot[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (!grid[row][col]) continue;
      const lat = LAT_TOP - row * STEP;
      const lng = -180 + col * STEP + STEP / 2;
      const { x, y } = project(lat, lng);
      dots.push({ x, y, row, col });
    }
  }

  cachedDots = dots;
  return dots;
}

/**
 * Trajectoire courbe entre deux points, façon route aérienne.
 * La courbure est proportionnelle à la distance, comme sur les cartes de
 * compagnies aériennes.
 */
export function arcPath(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  curvature = 0.28
): string {
  const a = project(from.lat, from.lng);
  const b = project(to.lat, to.lng);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);

  // Point de contrôle décalé perpendiculairement au segment.
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const normalX = -dy / (distance || 1);
  const normalY = dx / (distance || 1);
  const lift = distance * curvature;

  const controlX = midX + normalX * lift;
  const controlY = midY + normalY * lift;

  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/** Coordonnées formatées façon instrument de bord : « 48.8535° N / 2.4823° E ». */
export function formatCoordinates(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'O';
  return `${Math.abs(lat).toFixed(4)}° ${ns} / ${Math.abs(lng).toFixed(4)}° ${ew}`;
}
