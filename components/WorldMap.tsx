'use client';

import { useId, useMemo, useState } from 'react';
import { DESTINATIONS, type Destination } from '@/data/menu';
import { MAP_VIEW, arcPath, formatCoordinates, landDots, project } from '@/lib/worldmap';

const ACCENT_HEX: Record<Destination['accent'], string> = {
  aurora: '#3DE0FF',
  ember: '#FF7A45',
  saffron: '#FFC24B',
  plasma: '#7C5CFF',
  jade: '#34E5A0',
};

/**
 * Carte du monde interactive.
 *
 * Chaque point lumineux correspond à un univers culinaire RÉELLEMENT présent
 * au buffet (voir data/menu.ts). Aucune destination n'est décorative : si un
 * univers disparaît de la carte du restaurant, il disparaît d'ici.
 *
 * Accessibilité : les destinations sont de vrais boutons, atteignables au
 * clavier. Le survol et le focus déclenchent le même affichage, et la liste
 * sous la carte donne accès à la même information sans pointage — c'est elle
 * qui sert de référence sur mobile.
 */
export default function WorldMap() {
  const dots = useMemo(() => landDots(), []);
  const home = DESTINATIONS.find((d) => d.home) ?? DESTINATIONS[0];
  const stops = useMemo(() => DESTINATIONS.filter((d) => !d.home), []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const gradientId = useId();

  const active = DESTINATIONS.find((d) => d.id === activeId) ?? null;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-panel border border-white/10 bg-abyss">
        {/* Halo d'ambiance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(90% 70% at 50% 40%, rgba(124,92,255,0.14), transparent 70%),' +
              'radial-gradient(60% 50% at 18% 70%, rgba(61,224,255,0.10), transparent 70%)',
          }}
        />

        <svg
          viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
          className="relative block w-full"
          role="img"
          aria-label={`Carte du monde des univers culinaires du buffet : ${DESTINATIONS.filter((d) => !d.home)
            .map((d) => d.name)
            .join(', ')}.`}
        >
          <defs>
            <radialGradient id={`${gradientId}-glow`}>
              <stop offset="0%" stopColor="#3DE0FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#3DE0FF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${gradientId}-arc`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3DE0FF" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#3DE0FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF7A45" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Graticule : méridiens et parallèles */}
          <g stroke="#79859B" strokeWidth="0.5" opacity="0.1">
            {Array.from({ length: 13 }, (_, i) => {
              const x = (i / 12) * MAP_VIEW.width;
              return <line key={`m${i}`} x1={x} y1="0" x2={x} y2={MAP_VIEW.height} />;
            })}
            {Array.from({ length: 8 }, (_, i) => {
              const y = (i / 7) * MAP_VIEW.height;
              return <line key={`p${i}`} x1="0" y1={y} x2={MAP_VIEW.width} y2={y} />;
            })}
          </g>

          {/* Équateur, marqué plus franchement */}
          <line
            x1="0"
            y1={project(0, 0).y}
            x2={MAP_VIEW.width}
            y2={project(0, 0).y}
            stroke="#3DE0FF"
            strokeWidth="0.6"
            opacity="0.2"
            strokeDasharray="6 8"
          />

          {/* Masse continentale en points */}
          <g fill="#79859B">
            {dots.map((dot) => (
              <circle key={`${dot.row}-${dot.col}`} cx={dot.x} cy={dot.y} r="2.1" opacity="0.32" />
            ))}
          </g>

          {/* Trajectoires depuis le restaurant vers chaque escale */}
          <g fill="none" strokeLinecap="round">
            {stops.map((stop, index) => {
              const isActive = activeId === stop.id;
              return (
                <path
                  key={stop.id}
                  d={arcPath(home, stop)}
                  stroke={isActive ? ACCENT_HEX[stop.accent] : `url(#${gradientId}-arc)`}
                  strokeWidth={isActive ? 1.6 : 0.9}
                  opacity={activeId && !isActive ? 0.12 : isActive ? 0.95 : 0.45}
                  strokeDasharray="4 7"
                  className="transition-all duration-500 motion-safe:animate-[dash_linear_infinite]"
                  style={{ animationDuration: `${18 + index * 3}s` }}
                />
              );
            })}
          </g>

          {/* Escales */}
          <g>
            {DESTINATIONS.map((destination) => {
              const { x, y } = project(destination.lat, destination.lng);
              const color = ACCENT_HEX[destination.accent];
              const isActive = activeId === destination.id;
              const dimmed = activeId !== null && !isActive;

              return (
                <g
                  key={destination.id}
                  className="transition-opacity duration-300"
                  opacity={dimmed ? 0.3 : 1}
                >
                  {(isActive || destination.home) && (
                    <circle cx={x} cy={y} r="22" fill={color} opacity={isActive ? 0.13 : 0.08} />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={destination.home ? 5.5 : 4.5}
                    fill={color}
                    className="transition-all duration-300"
                    style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : undefined }}
                  />
                  {destination.home && (
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  )}

                  {/* Zone de clic généreuse : 40 px de large, doigt compatible */}
                  <foreignObject x={x - 20} y={y - 20} width="40" height="40">
                    <button
                      type="button"
                      className="h-10 w-10 cursor-pointer rounded-full bg-transparent"
                      onMouseEnter={() => setActiveId(destination.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(destination.id)}
                      onBlur={() => setActiveId(null)}
                      onClick={() => setActiveId((v) => (v === destination.id ? null : destination.id))}
                      aria-label={`${destination.name} — ${destination.highlights.join(', ')}`}
                      aria-pressed={isActive}
                    />
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Panneau d'information — remplacé par la liste ci-dessous sur mobile */}
        <div
          className="pointer-events-none absolute bottom-4 left-4 right-4 hidden md:block"
          aria-hidden="true"
        >
          <div
            className={`glass inline-flex max-w-md flex-col gap-2 rounded-2xl px-5 py-4 transition-all duration-300 ${
              active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            {active && (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ACCENT_HEX[active.accent] }}
                  />
                  <span className="font-mono text-micro-sm uppercase text-steel">{active.code}</span>
                  <span className="font-display text-xl text-chrome">{active.name}</span>
                </div>
                <p className="font-mono text-micro-sm uppercase text-titanium">
                  {active.highlights.join(' · ')}
                </p>
                <p className="font-mono text-[10px] tracking-wider text-steel/60">
                  {formatCoordinates(active.lat, active.lng)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Repères d'interface */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-steel/45 sm:block"
        >
          <div>Réseau {stops.length} escales</div>
          <div className="text-aurora/50">Départ {home.code}</div>
        </div>
      </div>

      {/* Liste des escales : référence sur mobile, complément au clavier ailleurs */}
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stops.map((stop) => {
          const isActive = activeId === stop.id;
          return (
            <li key={stop.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveId(stop.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(stop.id)}
                onBlur={() => setActiveId(null)}
                onClick={() => setActiveId((v) => (v === stop.id ? null : stop.id))}
                aria-pressed={isActive}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-white/25 bg-white/[0.06]'
                    : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ACCENT_HEX[stop.accent] }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-micro-sm uppercase text-steel">{stop.code}</span>
                </span>
                <span className="mt-1.5 block font-display text-sm text-chrome">{stop.name}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-steel">
                  {stop.highlights.join(', ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
