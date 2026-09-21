/**
 * PRÉPARATION DES TEXTURES DU GLOBE
 * ==========================================================================
 * Usage : npm run textures
 *
 * Ce script part des cartes terrestres NASA (domaine public, distribuées avec
 * les exemples de three.js) et produit :
 *
 *  1. des versions WebP à deux résolutions — 2K pour les écrans larges, 1K
 *     pour les mobiles, soit environ six fois moins d'octets que les sources ;
 *  2. une image de repli « Terre vue de l'espace », utilisée quand WebGL
 *     n'est pas disponible.
 *
 * L'image de repli n'est pas un simple rognage circulaire de la carte : le
 * script effectue une véritable projection orthographique (chaque pixel du
 * disque est reprojeté vers sa latitude/longitude, puis échantillonné dans la
 * carte équirectangulaire), avec éclairage, terminateur jour/nuit, lumières
 * de villes et halo atmosphérique. Le repli ressemble donc à ce que produit
 * le rendu 3D, et non à une carte plate enroulée.
 *
 * Les fichiers sources restent dans public/textures/ et ne sont pas servis :
 * seules les variantes WebP le sont.
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Les cartes d'origine vivent hors de public/ : elles ne doivent pas être
// déployées (1,7 Mo qui ne seraient jamais demandés par un navigateur).
const SRC = 'assets/earth-source';
const OUT = 'public/textures';

/* ─────────────────────────── 1. Variantes WebP ─────────────────────────── */

const VARIANTS = [
  // [source,                    sortie,             largeur, qualité, alpha]
  ['earth_atmos_2048.jpg', 'earth-day-2k.webp', 2048, 82, false],
  ['earth_atmos_2048.jpg', 'earth-day-1k.webp', 1024, 80, false],
  ['earth_lights_2048.png', 'earth-night-2k.webp', 2048, 76, false],
  ['earth_lights_2048.png', 'earth-night-1k.webp', 1024, 74, false],
  // Spéculaire et normales sont des signaux basse fréquence : 1K suffit
  // largement, l'œil ne fait pas la différence sur une sphère de 600 px.
  ['earth_specular_2048.jpg', 'earth-spec-1k.webp', 1024, 72, false],
  ['earth_normal_2048.jpg', 'earth-normal-1k.webp', 1024, 78, false],
  ['earth_clouds_1024.png', 'earth-clouds-1k.webp', 1024, 52, true],
];

async function buildVariants() {
  console.log('\n  Variantes WebP');
  let total = 0;

  for (const [src, out, width, quality, alpha] of VARIANTS) {
    const pipeline = sharp(path.join(SRC, src))
      .resize(width, width / 2, { fit: 'fill' })
      .webp({ quality, alphaQuality: alpha ? 72 : 100, effort: 6 });

    const buffer = await pipeline.toBuffer();
    await writeFile(path.join(OUT, out), buffer);
    total += buffer.length;
    console.log(`    ${out.padEnd(24)} ${String(Math.round(buffer.length / 1024)).padStart(5)} ko`);
  }

  console.log(`    ${'—'.repeat(24)} ${String(Math.round(total / 1024)).padStart(5)} ko au total`);
}

/* ──────────────────── 2. Image de repli, sans WebGL ─────────────────────── */

/** Échantillonnage bilinéaire dans une image équirectangulaire. */
function sample(data, w, h, channels, u, v) {
  const x = u * (w - 1);
  const y = v * (h - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const fx = x - x0;
  const fy = y - y0;

  const out = [0, 0, 0];
  for (let c = 0; c < 3; c += 1) {
    const p00 = data[(y0 * w + x0) * channels + c];
    const p10 = data[(y0 * w + x1) * channels + c];
    const p01 = data[(y1 * w + x0) * channels + c];
    const p11 = data[(y1 * w + x1) * channels + c];
    out[c] = p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) + p01 * (1 - fx) * fy + p11 * fx * fy;
  }
  return out;
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

async function buildFallback() {
  const SIZE = 900;
  // Marge pour le halo atmosphérique, qui déborde du disque terrestre.
  const RADIUS = SIZE * 0.42;

  console.log('\n  Image de repli (projection orthographique)');

  const day = await sharp(path.join(SRC, 'earth_atmos_2048.jpg')).raw().toBuffer({ resolveWithObject: true });
  const night = await sharp(path.join(SRC, 'earth_lights_2048.png')).raw().toBuffer({ resolveWithObject: true });

  const dw = day.info.width;
  const dh = day.info.height;
  const dc = day.info.channels;
  const nw = night.info.width;
  const nh = night.info.height;
  const nc = night.info.channels;

  // Cadrage : centré sur l'Europe et l'Afrique, pour que la France soit
  // visible — c'est la vue qui sert le propos du site.
  const lat0 = (30 * Math.PI) / 180;
  const lon0 = (10 * Math.PI) / 180;

  // Lumière venant de la gauche et légèrement du haut : le terminateur tombe
  // à droite du globe, là où le texte du hero n'est pas.
  const L = [-0.88, 0.26, 0.40];
  const Ln = Math.hypot(...L);
  const light = L.map((v) => v / Ln);

  const out = Buffer.alloc(SIZE * SIZE * 4);

  for (let py = 0; py < SIZE; py += 1) {
    for (let px = 0; px < SIZE; px += 1) {
      const idx = (py * SIZE + px) * 4;

      const nx = (px - SIZE / 2) / RADIUS;
      const ny = (py - SIZE / 2) / RADIUS;
      const r2 = nx * nx + ny * ny;
      const r = Math.sqrt(r2);

      if (r2 >= 1) {
        // ——— Halo atmosphérique au-delà du disque ———
        const glow = Math.pow(Math.max(0, 1 - (r - 1) / 0.28), 2.4);
        if (glow <= 0.004) {
          out[idx] = 0;
          out[idx + 1] = 0;
          out[idx + 2] = 0;
          out[idx + 3] = 0;
          continue;
        }
        // Le halo est plus intense du côté éclairé.
        const side = Math.max(0, (nx * -light[0] + ny * light[1]) / (r || 1));
        const intensity = glow * (0.34 + 0.66 * side);
        out[idx] = Math.round(70 * intensity);
        out[idx + 1] = Math.round(150 * intensity);
        out[idx + 2] = Math.round(235 * intensity);
        out[idx + 3] = Math.round(220 * intensity);
        continue;
      }

      // ——— Surface du globe ———
      const nz = Math.sqrt(1 - r2);

      // Repère caméra → repère terrestre (rotation en latitude puis longitude)
      const x = nx;
      const y = -ny;
      const z = nz;

      const y2 = y * Math.cos(lat0) - z * Math.sin(lat0);
      const z2 = y * Math.sin(lat0) + z * Math.cos(lat0);

      const lat = Math.asin(Math.max(-1, Math.min(1, y2)));
      const lon = Math.atan2(x, z2) + lon0;

      const u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
      const v = 0.5 - lat / Math.PI;

      const dayColor = sample(day.data, dw, dh, dc, u, v);
      const nightColor = sample(night.data, nw, nh, nc, u, v);

      // Éclairage diffus + terminateur adouci
      const diffuse = x * light[0] + y * light[1] + z * light[2];
      const lit = smoothstep(-0.22, 0.30, diffuse);

      // Réflexion de Fresnel sur le limbe : la Terre s'éclaircit sur le bord
      const fresnel = Math.pow(1 - nz, 3) * 0.55;

      for (let c = 0; c < 3; c += 1) {
        // Côté jour
        const dayLit = dayColor[c] * (0.10 + 0.95 * lit);
        // Côté nuit : bleu très sombre + lumières de villes discrètes
        const ambient = [5, 9, 18][c];
        const cityLights = nightColor[c] * 0.55 * (1 - lit);
        const value = dayLit + ambient * (1 - lit) + cityLights;

        // Halo bleuté sur le limbe
        const rim = fresnel * [46, 120, 200][c] * (0.25 + 0.75 * lit);

        out[idx + c] = Math.min(255, Math.round(value + rim));
      }

      // Anticrénelage du bord du disque
      out[idx + 3] = Math.round(255 * smoothstep(1, 0.985, r));
    }
  }

  const buffer = await sharp(out, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .webp({ quality: 88, effort: 6 })
    .toBuffer();

  await writeFile(path.join(OUT, 'earth-fallback.webp'), buffer);
  console.log(`    earth-fallback.webp      ${String(Math.round(buffer.length / 1024)).padStart(5)} ko  (${SIZE}x${SIZE})`);
}

/* ─────────────────────────────── Exécution ─────────────────────────────── */

await mkdir(OUT, { recursive: true });
await buildVariants();
await buildFallback();
console.log('\n  Terminé.\n');
