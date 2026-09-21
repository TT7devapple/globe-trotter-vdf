# Globe Trotter Val de Fontenay

Site officiel et système de réservation du restaurant **Globe Trotter Val de
Fontenay** — buffet à volonté, cuisine du monde.

> Centre Commercial Auchan Val de Fontenay, Avenue du Maréchal Joffre
> 94120 Fontenay-sous-Bois — **01 41 81 07 44**

---

## 1. Démarrage rapide

```bash
npm install
cp .env.example .env        # puis renseignez les valeurs (voir §4)
npm run db:push             # crée la base
npm run db:seed             # crée le compte administrateur
npm run dev                 # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Analyse statique |
| `npm run db:push` | Applique le schéma à la base |
| `npm run db:seed` | Crée / réinitialise le compte admin |
| `npm run db:studio` | Explorateur visuel de la base |
| `npm run admin:hash` | Génère `AUTH_SECRET` et un condensat de mot de passe |
| `npm run textures` | Régénère les textures du globe et l'image de repli |

---

## 2. Direction artistique — « Terminal 94 »

Le site est conçu comme **l'interface d'un terminal de vol gastronomique**.
Le restaurant est le terminal, chaque univers culinaire est une destination,
le repas est le voyage. Le nom interne fait référence au Val-de-Marne (94).

Ce parti pris n'est pas plaqué : les sources publiques décrivent déjà
l'établissement comme proposant « plus de 150 plats dans un cadre futuriste ».
La direction artistique prolonge donc une identité qui existe déjà, au lieu
d'en inventer une.

**Vocabulaire visuel** — grilles de navigation, coordonnées GPS, codes à trois
lettres, trajectoires courbes, micro-annotations en monospace, points
lumineux. Le futurisme passe par la **retenue** : beaucoup de noir profond,
des accents lumineux rares, aucune surface fluorescente.

**Palette** (définie dans `tailwind.config.ts`)

| Rôle | Jeton | Valeur |
|---|---|---|
| Fond principal | `void` | `#05070D` |
| Fond secondaire | `abyss` | `#080C16` |
| Surfaces | `hull` / `deck` | `#0E1420` / `#161E2E` |
| Texte principal | `chrome` | `#E9EDF4` |
| Texte courant | `titanium` | `#A8B3C5` |
| Texte secondaire | `steel` | `#79859B` |
| Accent — données, trajectoires | `aurora` | `#3DE0FF` |
| Accent — chaleur, grill, CTA | `ember` | `#FF7A45` |
| Accent — desserts, lumière | `saffron` | `#FFC24B` |
| Accent — nuit, profondeur | `plasma` | `#7C5CFF` |
| Statuts positifs | `jade` | `#34E5A0` |

Toutes les paires texte/fond utilisées atteignent **au moins 4,5:1**
(niveau AA pour le texte courant) ; la plupart dépassent 9:1.

**Typographie** — trois familles, trois rôles :
- **Space Grotesk** — titres et chiffres. Géométrique, chiffres très lisibles
  en très grande taille.
- **Inter** — textes courants.
- **JetBrains Mono** — micro-labels, coordonnées, références. C'est elle qui
  porte le vocabulaire « instrument de bord ».

---

## 3. Architecture

```
app/
  layout.tsx              Coque, polices, SEO, données structurées
  page.tsx                Accueil
  menu/                   Le buffet (exploration, filtres, allergènes)
  formules/               Formules et tarifs
  reserver/               Parcours de réservation
  galerie/                Galerie
  infos/                  Accès, horaires, services
  mentions-legales/
  admin/                  Tableau de bord (protégé)
    login/
  api/
    availability/         GET  — créneaux disponibles
    reservations/         POST — création d'une demande
    admin/auth/           POST/DELETE — connexion / déconnexion
    admin/reservations/   PATCH/DELETE — gestion (protégé)
  opengraph-image.tsx     Image de partage générée
  sitemap.ts  robots.ts  not-found.tsx

components/
  Header  Footer  Hero  Wordmark  Section  Visual  DataNotice  Reveal
  DishIllustration      Cadre, projecteur, annotations et tracé animé
  dishes/art.tsx        Les 19 planches dessinées
  Globe3D               Terre en rotation (three.js, WebGL)
  HeroGlobe             Détection WebGL, qualité, repli statique, habillage
  WorldMap              Carte interactive (SVG généré)
  DestinationCard  ImmersiveDish  BuffetSection  FormulaCard
  MenuExplorer          Filtres et catégories du buffet
  Gallery  Reviews  Location  OpeningHours  OpenStatus
  ReservationForm  ReservationConfirmation
  admin/AdminDashboard  admin/ReservationRow  admin/LoginForm

data/                   ← SOURCE UNIQUE DE VÉRITÉ (voir §5)
  restaurant.ts  menu.ts  formulas.ts  openingHours.ts
  reviews.ts  images.ts  verification.ts

lib/
  prisma.ts  auth.ts  validation.ts  datetime.ts
  reservations.ts       Disponibilités, anti-surréservation, anti-doublon
  worldmap.ts           Projection et géométrie de la carte

prisma/schema.prisma
scripts/seed.ts  scripts/hash-password.ts  scripts/build-textures.mjs
assets/earth-source/    Cartes NASA d'origine (hors public/, non déployées)
public/textures/        Variantes WebP + image de repli
```

### Technologies

| Besoin | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 15 (App Router) | Rendu serveur + routes API dans un seul projet |
| Langage | TypeScript strict | — |
| Styles | Tailwind CSS 3 | Design system centralisé dans un fichier |
| Base de données | Prisma + SQLite / PostgreSQL | Même code, base interchangeable |
| Validation | Zod | Mêmes règles côté client et serveur |
| Authentification | `jose` (JWT) + `bcryptjs` | Aucun fournisseur tiers, aucune dépendance d'hébergeur |
| Cartographie | SVG généré + OpenStreetMap | Aucune clé d'API, aucune facturation, aucun traceur |
| Globe 3D | three.js (import dynamique) | Rendu WebGL, chargé uniquement quand il sert |

**Aucune bibliothèque d'animation.** Toutes les animations de l'interface sont
en CSS ou en SVG ; three.js ne sert qu'au globe du hero et est chargé
séparément. Le premier chargement de l'accueil représente **115 ko de
JavaScript**, dont 103 ko de socle React partagé.

---

## 3 bis. Le globe terrestre du hero

Le hero est occupé par une Terre photoréaliste en rotation continue.

### Ce qui est affiché, et dans quel ordre

1. **Image statique** (`earth-fallback.webp`, 89 ko) — affichée immédiatement.
   Ce n'est pas un rognage circulaire d'une carte : `scripts/build-textures.mjs`
   effectue une véritable **projection orthographique** avec éclairage,
   terminateur jour/nuit, lumières de villes et halo atmosphérique.
2. **Globe 3D** — three.js est chargé à la demande, puis le globe animé
   apparaît en fondu par-dessus l'image.
3. **En cas d'échec**, l'image reste. Il n'y a jamais d'écran vide.

### Rendu

`components/Globe3D.tsx` contient un nuanceur dédié :

- mélange jour/nuit avec terminateur progressif ;
- lumières de villes seuillées, visibles du seul côté nuit ;
- reflet spéculaire sur les océans uniquement (carte spéculaire) ;
- relief du terrain par carte de normales, repère tangent calculé
  analytiquement pour une sphère ;
- halo atmosphérique sur une sphère séparée rendue par l'intérieur ;
- couche de nuages en rotation indépendante ;
- champ d'étoiles, majoritairement très faibles, pour éviter l'effet « ciel
  de jeu vidéo ».

La direction du soleil est **fixe dans le repère du monde** : le terminateur
reste immobile pendant que la Terre tourne, comme dans la réalité.

### Rotation et souris

L'angle de rotation est **accumulé**, jamais recalculé depuis un temps absolu :
il ne peut ni sauter, ni se réinitialiser, même après plusieurs minutes de
pause. La vitesse est d'environ 0,55°/s, soit un tour en dix minutes.

La parallaxe à la souris s'applique à un **groupe parent** ; la Terre tourne
sur son propre axe à l'intérieur. Les deux mouvements sont donc totalement
indépendants et le curseur ne peut jamais interrompre la rotation.

### Performance

| Mesure | Résultat (build de production, Intel UHD Graphics) |
|---|---|
| Fluidité | **60 i/s**, p95 **17,0 ms**, pire image 17,4 ms |
| JS au premier chargement | **115 ko** — inchangé : three.js (315 ko) est dans un morceau séparé chargé à la demande |
| Textures, qualité réduite | ~98 ko |
| Textures, qualité élevée | ~538 ko, dont les nuages (118 ko) chargés après coup |

Mécanismes en place :

- densité de pixels plafonnée (1,75 en qualité élevée, 1,5 sinon) ;
- deux jeux de textures, 2K et 1K, choisis selon l'appareil ;
- **mise en pause** hors du champ de vision (IntersectionObserver) et quand
  l'onglet est inactif ;
- **dégradation automatique** : si la moyenne dépasse 22 ms sur 90 images, les
  nuages sont retirés et la densité de pixels abaissée ;
- libération complète des ressources WebGL au démontage, `forceContextLoss()`
  compris — un navigateur n'autorise qu'un nombre limité de contextes ;
- gestion de `webglcontextlost` / `webglcontextrestored`.

### Quand l'image statique est-elle utilisée ?

- `prefers-reduced-motion: reduce` est actif ;
- WebGL est indisponible ;
- le rendu est purement logiciel (SwiftShader, llvmpipe) — techniquement
  fonctionnel mais trop lent pour une page d'accueil ;
- le chargement des textures échoue.

> **À savoir** : si votre poste a « réduire les animations » activé dans
> Windows ou macOS, vous verrez la Terre statique et non le globe animé.
> C'est le comportement attendu.

### Textures

Cartes **NASA / Blue Marble**, domaine public, distribuées avec les exemples de
three.js. Les fichiers d'origine sont dans `assets/earth-source/` — **hors de
`public/`**, pour ne pas déployer 1,7 Mo que personne ne demandera. Seules les
variantes WebP produites par `npm run textures` sont servies.

---

## 3 ter. Les illustrations des plats

Chaque plat est représenté par une **planche dessinée** dans le style du site :
trait fin clair, volumes en teintes d'accent sombres, filets d'annotation en
monospace, repères de cadrage. Ce sont des illustrations assumées — la galerie
et chaque planche l'indiquent — jamais présentées comme des photographies.

- **19 planches**, une par type de plat présent dans `data/menu.ts` (sushi, maki,
  rouleaux californiens, wok, riz sauté, grillades, volaille, mijoté, pizza,
  pâtes, fruits de mer, poisson, pâtisserie, glaces, fruits, confiseries,
  salades, boissons fraîches et chaudes). Code : `components/dishes/art.tsx`.
- Les **annotations** ne nomment que ce que la carte du restaurant mentionne
  (noms, descriptions, allergènes). Exemple : les rouleaux californiens sont
  dessinés riz à l'extérieur, parce que la carte les décrit ainsi.
- **Tracé animé** : le dessin se trace à son entrée dans le champ de vision,
  puis les volumes apparaissent et les annotations se posent. Vapeur et
  flammes bougent en continu, très discrètement. Sans JavaScript ou avec
  « réduire les animations », le dessin s'affiche complet d'emblée.
- **Poids** : les 19 planches pèsent environ 10 ko de JavaScript au total, sans
  aucune requête d'image.

### Choisir le dessin d'un plat

Chaque catégorie a un champ `illustration` ; un plat peut le surcharger :

```ts
{ id: 'california', illustration: 'uramaki', name: 'Rouleaux californiens', ... }
```

### Passer aux photos

Une photo l'emporte toujours sur le dessin : renseignez `image` sur un plat
(`data/menu.ts`) ou `src` sur une entrée de galerie (`data/images.ts`).

---

## 4. Variables d'environnement

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DATABASE_URL` | oui | `file:./dev.db` en local, URL PostgreSQL en production |
| `AUTH_SECRET` | oui | Signature des sessions admin. 32 caractères minimum. `npm run admin:hash` en génère un |
| `ADMIN_EMAIL` | oui | Identifiant admin (lu par `db:seed`) |
| `ADMIN_PASSWORD` | oui | Mot de passe admin, 12 caractères minimum. **Jamais stocké en clair** |
| `ADMIN_NAME` | non | Nom affiché dans l'administration |
| `NEXT_PUBLIC_SITE_URL` | oui en prod | URL canonique, sans barre oblique finale |
| `NEXT_PUBLIC_CONTACT_EMAIL` | non | Adresse de contact publique |

---

## 5. Gérer le contenu sans toucher au code

Tout le contenu éditorial vit dans `data/`. Modifier un de ces fichiers suffit :
la navigation, les filtres, la carte du monde, le plan du site et les données
structurées se mettent à jour automatiquement.

| Fichier | Contenu |
|---|---|
| `data/restaurant.ts` | Nom, adresse, téléphone, services, réseaux sociaux, capacité en ligne |
| `data/menu.ts` | Catégories, plats, allergènes, destinations de la carte |
| `data/formulas.ts` | Formules, horaires, **tarifs** |
| `data/openingHours.ts` | Services, créneaux, jours de fermeture |
| `data/reviews.ts` | Avis clients, note Google |
| `data/images.ts` | Chemins des photographies |
| `data/verification.ts` | **Registre des données à confirmer + interrupteurs de sections** |

### Ajouter une catégorie au buffet

Ajoutez une entrée dans `MENU` (`data/menu.ts`). Si vous renseignez
`destinationId`, un point apparaît automatiquement sur la carte du monde.

### Afficher les tarifs

1. Renseignez `price` pour chaque formule dans `data/formulas.ts`.
2. Dans `data/verification.ts`, passez `FEATURES.showPrices` à `true`.

### Ajouter les photographies

Voir `public/images/README.md`. Déposez les fichiers, renseignez
`data/images.ts` : chaque emplacement bascule automatiquement.

---

## 6. Réservations

### Parcours client

Trois étapes : créneau → coordonnées → récapitulatif. Les disponibilités sont
interrogées en direct.

**Le site ne promet jamais une table confirmée.** Le statut initial est
`EN_ATTENTE`, et l'écran de fin l'explique : le restaurant valide lui-même,
puis recontacte le client. Annoncer une confirmation immédiate que le
restaurant n'a pas donnée se retournerait contre lui le soir même.

### Garde-fous en place

| Risque | Protection |
|---|---|
| Surréservation | Contrôle de capacité **et** insertion dans une seule transaction |
| Double réservation | Refus si même e-mail + même date + même service |
| Robots | Champ piège invisible + limitation à 5 demandes par heure et par IP |
| Réservation de dernière minute | Délai minimum de 2 h avant le repas |
| Groupes | Au-delà de 10 personnes, renvoi vers le téléphone |
| Jour de fermeture | Refusé côté client **et** côté serveur |

La capacité réservable en ligne est un **plafond de sécurité**
(`RESTAURANT.onlineCapacity`, 60 couverts par service par défaut), pas la
capacité réelle du restaurant, qui n'est pas publique. Elle s'ajuste date par
date via le modèle `CapacityOverride`.

### Statuts

`EN_ATTENTE` → `CONFIRMEE` ou `ANNULEE`. Une annulation **libère les couverts**
sans supprimer la trace.

---

## 7. Administration

`/admin` — protégée par session JWT en cookie `httpOnly`.

**Compte** : créé par `npm run db:seed` à partir de `ADMIN_EMAIL` et
`ADMIN_PASSWORD`. Relancer `db:seed` met à jour le mot de passe — c'est aussi
la procédure de réinitialisation.

**Trois vues**
- **Réservations** — liste groupée par jour, filtres par statut, service,
  période et recherche libre. Les filtres passent par l'URL : une vue utile
  (« les demandes en attente ») se met en favori.
- **Calendrier** — charge sur six semaines, couverts par jour, pastille sur les
  jours comportant des demandes non traitées. Un clic filtre la liste.
- **Données à confirmer** — les points non vérifiés et la marche à suivre.

**Actions** : Confirmer et Annuler sont accessibles en un clic depuis la
liste. Modifier (date, heure, couverts, contacts, note interne) et Supprimer
sont dans la fiche dépliée ; la suppression demande confirmation, c'est la
seule action irréversible.

Déplacer une réservation d'un service à l'autre met à jour le champ `service`
automatiquement — sans quoi les compteurs de capacité deviendraient faux.

---

## 8. Déploiement

### Netlify

1. Connectez le dépôt.
2. Build : `npm run build` — Publication : `.next`
3. Ajoutez `@netlify/plugin-nextjs` (`npm i -D @netlify/plugin-nextjs`).
4. Renseignez les variables d'environnement dans l'interface Netlify.
5. **Passez `DATABASE_URL` sur PostgreSQL** : le système de fichiers de Netlify
   est éphémère, une base SQLite y serait effacée à chaque déploiement.

### Migrer vers un autre hébergeur

`netlify.toml` est **la seule adhérence à Netlify**. Le supprimer suffit.

| Cible | Marche à suivre |
|---|---|
| **Vercel** | Import du dépôt, variables d'environnement, déploiement. Rien d'autre |
| **VPS / Node** | `npm ci && npm run build && npm run start` derrière un reverse proxy |
| **Docker** | Image `node:20-alpine`, mêmes commandes |

### Passer de SQLite à PostgreSQL

1. `prisma/schema.prisma` : `provider = "sqlite"` → `"postgresql"`
2. `DATABASE_URL="postgresql://…"`
3. `npx prisma db push`

Aucun autre fichier n'est concerné : le schéma a été écrit pour que ce
changement n'impose aucune migration de données (voir les commentaires de
`prisma/schema.prisma` sur le choix de `String` plutôt que d'enum).

---

## 9. Référencement

- Titres et descriptions ciblant « Globe Trotter Val de Fontenay », « buffet à
  volonté Fontenay-sous-Bois », « restaurant buffet Fontenay »
- Open Graph et Twitter Card, image de partage générée à la volée
- `sitemap.xml` et `robots.txt` générés (admin et API exclus de l'index)
- Schema.org `Restaurant` complet : adresse, géolocalisation, horaires,
  services, menu structuré en 9 sections, lien de réservation
- Fil d'Ariane `BreadcrumbList`

**`aggregateRating` est volontairement absent** des données structurées.
Déclarer une note agrégée non vérifiée expose à une pénalité Google.

---

## 10. Accessibilité

- Contrastes AA vérifiés sur toutes les paires texte/fond
- Un seul `<h1>` par page, hiérarchie de titres continue
- Lien d'évitement en premier élément focalisable
- Navigation clavier complète ; focus toujours visible (anneau cyan)
- Menu mobile : focus piégé, fermeture par `Échap`, défilement verrouillé
- Carte du monde utilisable au clavier, doublée d'une liste textuelle
- `prefers-reduced-motion` respecté : les animations sont neutralisées, rien
  n'est masqué ni rendu inaccessible
- Champs de formulaire à 16 px minimum (empêche le zoom automatique iOS)
- Cibles tactiles de 44 px minimum
- Texte alternatif obligatoire sur chaque entrée de galerie

---

## 11. Données restant à confirmer

Ces informations n'ont **pas** pu être vérifiées. Elles sont masquées ou
explicitement signalées sur le site, jamais présentées comme certaines.
Le registre complet est dans `data/verification.ts`, également consultable
depuis l'onglet « Données à confirmer » de l'administration.

| Point | Situation | Action |
|---|---|---|
| **Horaires** | 3 versions contradictoires : `12h–15h / 19h–23h`, `12h–14h30 / 19h–22h30`, `12h–22h30` (fiche Aushopping) | Trancher, corriger `data/openingHours.ts` |
| **Tarifs** | Aucun tarif fiable pour Val de Fontenay. Les montants les plus diffusés (18,80 € / 25,80 €) sont ceux de **Chelles et Bezons** | Renseigner `data/formulas.ts`, activer `FEATURES.showPrices` |
| **Note Google** | `3,7/5 (760 avis)` contre `3,9/5 (641 avis)` | Relever la note réelle, remplir `GOOGLE_RATING` |
| **Instagram** | 3 comptes revendiquent l'établissement : `@globetrotter_vdf` (~10 k), `@globetrotter_valdefontenay` (~4,3 k), `@globe_trotter_fontenay_s_bois` | Identifier l'officiel, remplir `RESTAURANT.social` |
| **« 150 plats »** | Repris par plusieurs agrégateurs, tous dérivés d'un même texte marketing | Confirmer, activer `FEATURES.showNumericStats` |
| **Boissons incluses** | Mentionné pour le soir et le week-end, jamais par une source officielle | Confirmer |
| **Live cooking** | Postes wok et grill cités, préparation devant le client non confirmée | Confirmer, activer `FEATURES.showLiveCooking` |
| **Composition du buffet** | Univers confirmés, plats précis non documentés | Détailler `data/menu.ts` |
| **Photographies** | Aucune photo libre de droits | Voir `public/images/README.md` |
| **Mentions légales** | SIRET, raison sociale, hébergeur, directeur de publication | **Obligation légale** — à compléter avant mise en ligne |

**Avant la mise en ligne publique**, passez `FEATURES.showDataBanner` à `false`
dans `data/verification.ts` pour retirer le bandeau de recette.

---

## 12. Pistes pour une V2

1. **Notification par e-mail** — accusé de réception au client, alerte au
   restaurant à chaque demande. Un service transactionnel (Resend, Postmark)
   s'intègre en une fonction dans `lib/reservations.ts`.
2. **Confirmation par SMS** — le canal le plus efficace pour un restaurant ;
   divise les tables non honorées.
3. **Annulation en autonomie** — un lien signé dans l'e-mail de confirmation,
   pour que le client libère sa table sans appeler.
4. **Éditeur de menu en ligne** — l'administration lit aujourd'hui `data/`,
   il resterait à écrire l'interface d'édition et à basculer le stockage en base.
5. **Plan de salle** — affectation des tables dans l'administration.
6. **Multilingue** — le centre commercial draine une clientèle internationale ;
   une version anglaise est le premier gain.
7. **Photographies professionnelles** — le levier de conversion le plus fort
   pour un restaurant. C'est ce qui manque le plus aujourd'hui.
8. **Mesure d'audience respectueuse** — Plausible ou Umami, sans bandeau cookies.

---

## 13. Sources consultées

Recherche menée le 20 septembre 2026.

- [Fiche du centre commercial Aushopping Val de Fontenay](https://fontenay.aushopping.com/restaurants/globe-trotter-fr-fontenay)
- [RestaurantGuru — Globe Trotter Val de Fontenay](https://restaurantguru.com/Globe-trotter-fontenay-sous-bois-Fontenay-sous-Bois)
- [Kazfeed — Globe Trotter Val de Fontenay](https://kazfeed.com/restaurant/globe-trotter-val-de-fontenay-121643)
- [Too Good To Go — Globe Trotter Val de Fontenay](https://www.toogoodtogo.com/fr/find/fontenay-sous-bois/globetrotter-valdefontenay)
- [Instagram @globetrotter_vdf](https://www.instagram.com/globetrotter_vdf/)
- [Facebook — Globe Trotter Val de Fontenay](https://www.facebook.com/p/Globe-trotter-Val-de-Fontenay-61561355845000/)

Les établissements Globe Trotter de **Chelles** et **Bezons** ont été
explicitement écartés des données retenues.
