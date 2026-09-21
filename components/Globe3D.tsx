'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * GLOBE TERRESTRE 3D
 * ==========================================================================
 * Rendu WebGL d'une Terre photoréaliste, destiné au fond du hero.
 *
 * Cartes utilisées : NASA / Blue Marble (domaine public), redimensionnées et
 * converties en WebP par `npm run textures`. Voir scripts/build-textures.mjs.
 *
 * ── Espace colorimétrique ────────────────────────────────────────────────
 * Le mélange jour/nuit et le halo sont calculés directement dans l'espace
 * d'affichage (sRGB), et la couleur finale est écrite telle quelle. Un
 * ShaderMaterial ne reçoit aucune conversion automatique de three.js : en
 * travaillant de bout en bout en sRGB, on évite un aller-retour linéaire
 * imprécis, et le rendu correspond exactement aux textures d'origine et à
 * l'image de repli générée hors ligne.
 *
 * ── Découpage des responsabilités ────────────────────────────────────────
 * Ce composant ne connaît rien du hero : il remplit son conteneur, expose un
 * `onReady`, et se nettoie intégralement au démontage. Le choix d'afficher le
 * globe ou l'image de repli appartient à components/HeroGlobe.tsx.
 */

export type GlobeQuality = 'high' | 'low';

type Props = {
  /** Niveau de détail initial. Il peut être abaissé automatiquement. */
  quality: GlobeQuality;
  /** Appelé une fois les textures chargées et la première image rendue. */
  onReady?: () => void;
  className?: string;
};

/* ─────────────────────────────── Nuanceurs ─────────────────────────────── */

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform vec3 lightDirection;
  uniform float nightIntensity;
  #ifdef USE_BUMP
    uniform sampler2D normalMap;
    uniform float bumpStrength;
  #endif

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(lightDirection);

    #ifdef USE_BUMP
      /*
       * Relief du terrain.
       * Sur une sphère à coordonnées équirectangulaires, le repère tangent se
       * construit analytiquement : la tangente pointe vers l'est, la
       * bitangente vers le nord. La caméra n'ayant aucune rotation propre,
       * l'axe vertical du monde reste valable dans le repère de vue.
       * Le relief n'agit que sur l'éclairage, pas sur la silhouette — c'est
       * suffisant pour faire ressortir chaînes de montagnes et reliefs
       * côtiers, pour le coût d'une seule lecture de texture.
       */
      vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), normal));
      vec3 bitangent = cross(normal, tangent);
      vec3 bump = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
      normal = normalize(normal + (tangent * bump.x + bitangent * bump.y) * bumpStrength);
    #endif

    // Terminateur : transition douce entre le jour et la nuit. La plage
    // asymétrique reproduit la pénombre, plus étendue côté nuit.
    float incidence = dot(normal, light);
    // Plage asymetrique et large : le terminateur reste progressif, mais une
    // plus grande part du disque visible reste eclairee — sans quoi la Terre
    // parait sous-exposee a cote du reste de la page.
    float lit = smoothstep(-0.30, 0.26, incidence);

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;

    // Les lumières de villes ne doivent apparaître que du côté nuit, et
    // rester discrètes : elles sont seuillées puis fortement atténuées.
    float cityMask = smoothstep(0.08, 0.38, max(max(night.r, night.g), night.b));
    vec3 cities = night * cityMask * nightIntensity * (1.0 - lit);

    // Face nocturne : bleu très sombre plutôt que du noir pur, sinon la
    // sphère se confond avec le fond et perd son volume.
    vec3 nightBase = vec3(0.012, 0.022, 0.045);

    // Le facteur d'exposition compense la faible dynamique de la carte NASA.
    vec3 color = mix(nightBase, day * 1.22, lit) + cities;

    // Reflet spéculaire sur les océans uniquement (la carte spéculaire vaut
    // ~1 sur l'eau, ~0 sur les terres).
    float ocean = texture2D(specMap, vUv).r;
    vec3 halfVector = normalize(light + vViewDir);
    float specular = pow(max(dot(normal, halfVector), 0.0), 38.0);
    color += vec3(0.30, 0.42, 0.55) * specular * ocean * lit * 0.85;

    // Diffusion atmosphérique sur le limbe : la Terre s'éclaircit et bleuit
    // sur son bord, d'autant plus du côté éclairé.
    float fresnel = pow(1.0 - max(dot(normal, vViewDir), 0.0), 3.0);
    color += vec3(0.16, 0.38, 0.68) * fresnel * (0.22 + 0.78 * lit);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 lightDirection;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 normal = normalize(vNormal);

    // Sphère rendue par l'intérieur : l'intensité croît vers le limbe.
    float rim = pow(1.0 - abs(dot(normal, vViewDir)), 2.6);

    // Le halo est nettement plus vif du côté du soleil.
    float lit = smoothstep(-0.55, 0.45, dot(normal, normalize(lightDirection)));

    float alpha = rim * (0.10 + 0.90 * lit);
    vec3 color = mix(vec3(0.10, 0.22, 0.45), vec3(0.34, 0.62, 1.0), lit);

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

/* ──────────────────────────────── Composant ─────────────────────────────── */

export default function Globe3D({ quality, onReady, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // `onReady` est lue via une référence : la passer en dépendance de l'effet
  // recréerait toute la scène si le parent la redéfinit à chaque rendu.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: quality === 'high',
      alpha: true,
      powerPreference: 'high-performance',
    });

    // Plafonner la densité de pixels est le réglage le plus rentable : un
    // écran à 3x rendrait neuf fois plus de pixels qu'un écran à 1x pour une
    // différence invisible sur une sphère.
    const maxPixelRatio = quality === 'high' ? 1.75 : 1.5;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    /* ── Scène et caméra ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 3.05);

    // Groupe parent : il porte l'inclinaison et la parallaxe, pendant que la
    // Terre tourne sur son propre axe. Les deux mouvements restent ainsi
    // totalement indépendants — la souris ne peut jamais interrompre la
    // rotation automatique.
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Inclinaison de l'axe terrestre : 23,4°, comme la vraie.
    const tilt = new THREE.Group();
    tilt.rotation.z = THREE.MathUtils.degToRad(23.4);
    pivot.add(tilt);

    /* ── Direction du soleil ── */
    // Fixe dans le repère du monde : le terminateur reste immobile pendant
    // que la Terre tourne, comme dans la réalité.
    const lightDirection = new THREE.Vector3(-0.85, 0.26, 0.42).normalize();

    /* ── Textures ── */
    const loader = new THREE.TextureLoader();
    const suffix = quality === 'high' ? '2k' : '1k';
    const textures: THREE.Texture[] = [];

    const load = (url: string): Promise<THREE.Texture> =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          (texture) => {
            texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
            texture.colorSpace = THREE.NoColorSpace; // voir l'en-tête du fichier
            textures.push(texture);
            resolve(texture);
          },
          undefined,
          reject
        );
      });

    /* ── Étoiles ── */
    const starCount = quality === 'high' ? 1400 : 550;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starOpacities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i += 1) {
      // Répartition sur une coquille sphérique lointaine, en évitant que des
      // étoiles se retrouvent devant le globe.
      const radius = 14 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
      // Une majorité d'étoiles très faibles, quelques-unes plus marquées :
      // c'est ce déséquilibre qui évite l'aspect « ciel de jeu vidéo ».
      const brightness = Math.pow(Math.random(), 3.2);
      starSizes[i] = 0.5 + brightness * 1.8;
      starOpacities[i] = 0.16 + brightness * 0.62;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('aOpacity', new THREE.BufferAttribute(starOpacities, 1));

    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: pixelRatio } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aOpacity;
        uniform float uPixelRatio;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = aSize * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vOpacity;
        void main() {
          // Point circulaire adouci, plutôt qu'un carré.
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float falloff = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(vec3(0.85, 0.90, 1.0), vOpacity * falloff);
        }
      `,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    /* ── Géométries ── */
    const segments = quality === 'high' ? 72 : 48;
    const earthGeometry = new THREE.SphereGeometry(1, segments, segments / 2);
    const atmosphereGeometry = new THREE.SphereGeometry(1.028, 64, 32);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      uniforms: { lightDirection: { value: lightDirection } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    pivot.add(atmosphere);

    let earth: THREE.Mesh | null = null;
    let earthMaterial: THREE.ShaderMaterial | null = null;
    let clouds: THREE.Mesh | null = null;
    let cloudMaterial: THREE.MeshBasicMaterial | null = null;
    let cloudGeometry: THREE.SphereGeometry | null = null;

    /* ── Boucle d'animation ── */
    let frameId = 0;
    let running = false;
    let visible = true;
    let inViewport = true;

    const clock = new THREE.Clock();
    // L'angle est accumulé, jamais recalculé depuis un temps absolu : la
    // rotation ne peut donc ni sauter, ni se réinitialiser, même après une
    // mise en pause de plusieurs minutes.
    let earthAngle = 0;
    let cloudAngle = 0;

    // Parallaxe : cible suivie par interpolation, jamais appliquée d'un coup.
    const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Surveillance des performances : si le rendu décroche durablement, on
    // abaisse la qualité plutôt que de laisser la page saccader.
    let frameSamples = 0;
    let frameTimeSum = 0;
    let degraded = false;

    const degrade = () => {
      if (degraded) return;
      degraded = true;

      if (clouds) {
        pivot.remove(clouds);
        cloudGeometry?.dispose();
        cloudMaterial?.map?.dispose();
        cloudMaterial?.dispose();
        clouds = null;
      }
      pixelRatio = Math.min(pixelRatio, 1);
      renderer.setPixelRatio(pixelRatio);
      starMaterial.uniforms.uPixelRatio.value = pixelRatio;
      resize();
    };

    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.1); // borne les gros écarts

      // ~0,55°/s : un tour complet en un peu plus de dix minutes. Assez lent
      // pour être cinématographique, assez rapide pour que le mouvement soit
      // perceptible dès les premières secondes.
      earthAngle += delta * 0.0096;
      cloudAngle += delta * 0.0122; // les nuages dérivent un peu plus vite

      if (earth) earth.rotation.y = earthAngle;
      if (clouds) clouds.rotation.y = cloudAngle;

      // Interpolation exponentielle, indépendante de la fréquence d'images.
      const smoothing = 1 - Math.exp(-delta * 3.2);
      parallax.x += (parallax.targetX - parallax.x) * smoothing;
      parallax.y += (parallax.targetY - parallax.y) * smoothing;

      pivot.rotation.y = parallax.x;
      pivot.rotation.x = parallax.y;
      stars.rotation.y = parallax.x * 0.35;
      stars.rotation.x = parallax.y * 0.35;

      renderer.render(scene, camera);

      if (!degraded && quality === 'high') {
        frameTimeSum += delta;
        frameSamples += 1;
        if (frameSamples >= 90) {
          const averageMs = (frameTimeSum / frameSamples) * 1000;
          if (averageMs > 22) degrade(); // en dessous d'environ 45 images/s
          frameSamples = 0;
          frameTimeSum = 0;
        }
      }
    };

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      render();
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      clock.getDelta(); // absorbe le temps écoulé pendant la pause
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    };

    const syncPlayback = () => {
      if (visible && inViewport) start();
      else stop();
    };

    /* ── Redimensionnement ── */
    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;

      // Le globe doit garder la même présence quel que soit le format : on
      // élargit le champ de vision sur les fenêtres étroites et hautes, sans
      // quoi la sphère déborderait largement du cadre sur mobile.
      const referenceAspect = 16 / 9;
      const fov = camera.aspect < referenceAspect ? 34 * (referenceAspect / camera.aspect) ** 0.42 : 34;
      camera.fov = Math.min(fov, 62);
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    cleanups.push(() => resizeObserver.disconnect());
    resize();

    /* ── Mise en pause hors écran et onglet inactif ── */
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);
    cleanups.push(() => intersectionObserver.disconnect());

    const onVisibilityChange = () => {
      visible = document.visibilityState === 'visible';
      syncPlayback();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

    /* ── Parallaxe à la souris ── */
    // Volontairement faible : la souris incline la scène de quelques degrés,
    // elle ne prend jamais la main sur la rotation.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      parallax.targetX = x * 0.085;
      parallax.targetY = y * 0.055;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    cleanups.push(() => window.removeEventListener('pointermove', onPointerMove));

    /* ── Perte de contexte WebGL ── */
    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
    };
    const onContextRestored = () => {
      resize();
      syncPlayback();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    cleanups.push(() => {
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    });

    /* ── Chargement des textures, puis mise en scène ── */
    // La carte de relief n'est chargée qu'en qualité élevée : 27 ko et une
    // lecture de texture de plus, pour un gain visible seulement sur les
    // grands écrans.
    const essential = Promise.all([
      load(`/textures/earth-day-${suffix}.webp`),
      load(`/textures/earth-night-${suffix}.webp`),
      load('/textures/earth-spec-1k.webp'),
      quality === 'high' ? load('/textures/earth-normal-1k.webp').catch(() => null) : Promise.resolve(null),
    ]);

    essential
      .then(([dayMap, nightMap, specMap, normalMap]) => {
        if (disposed) return;

        earthMaterial = new THREE.ShaderMaterial({
          vertexShader: EARTH_VERTEX,
          fragmentShader: EARTH_FRAGMENT,
          defines: normalMap ? { USE_BUMP: '' } : {},
          uniforms: {
            dayMap: { value: dayMap },
            nightMap: { value: nightMap },
            specMap: { value: specMap },
            lightDirection: { value: lightDirection },
            nightIntensity: { value: 0.62 },
            ...(normalMap
              ? { normalMap: { value: normalMap }, bumpStrength: { value: 0.55 } }
              : {}),
          },
        });

        earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.y = earthAngle;
        tilt.add(earth);

        renderer.render(scene, camera);
        onReadyRef.current?.();
        syncPlayback();

        // Les nuages arrivent après coup : c'est la texture la plus lourde,
        // et le globe est déjà présentable sans elle.
        if (quality === 'high') {
          load('/textures/earth-clouds-1k.webp')
            .then((cloudMap) => {
              if (disposed || degraded) return;
              cloudGeometry = new THREE.SphereGeometry(1.006, 64, 32);
              cloudMaterial = new THREE.MeshBasicMaterial({
                map: cloudMap,
                transparent: true,
                opacity: 0.26,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
              });
              clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
              clouds.rotation.y = cloudAngle;
              tilt.add(clouds);
            })
            .catch(() => {
              /* Les nuages sont un agrément : leur absence est sans conséquence. */
            });
        }
      })
      .catch((error) => {
        console.error('[Globe3D] Chargement des textures impossible', error);
        // Le parent affiche l'image de repli si `onReady` n'est jamais appelé.
      });

    /* ── Démontage ── */
    return () => {
      disposed = true;
      stop();
      cleanups.forEach((fn) => fn());

      earthGeometry.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      earthMaterial?.dispose();
      cloudGeometry?.dispose();
      cloudMaterial?.map?.dispose();
      cloudMaterial?.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      textures.forEach((texture) => texture.dispose());

      renderer.dispose();
      // Libère explicitement le contexte : un navigateur n'en autorise qu'un
      // nombre limité simultanément, et la navigation côté client peut monter
      // et démonter ce composant plusieurs fois.
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quality]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
