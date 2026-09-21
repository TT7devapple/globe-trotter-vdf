/**
 * LE BUFFET — UNIVERS CULINAIRES & CARTE
 * ==========================================================================
 * RÈGLE ABSOLUE : ce fichier ne contient que des univers culinaires cités par
 * des sources publiques concordantes (sushi, maki, wok, grillades, pizza,
 * pâtes, fruits de mer, salades, plats mijotés, desserts, glaces, fruits).
 *
 * Les intitulés de plats sont volontairement GÉNÉRIQUES. Aucune recette
 * précise n'a été inventée : la composition exacte du buffet n'est pas
 * documentée publiquement (voir data/verification.ts, clé `cuisines`).
 *
 * POUR LE RESTAURANT : ce fichier est fait pour être édité. Ajoutez, renommez
 * ou supprimez librement des entrées — le site s'adapte automatiquement
 * (navigation, filtres, carte du monde, SEO).
 */

export type AllergenId =
  | 'gluten'
  | 'crustaces'
  | 'oeuf'
  | 'poisson'
  | 'soja'
  | 'lait'
  | 'fruits-coque'
  | 'sesame'
  | 'sulfites'
  | 'mollusques';

export const ALLERGENS: Record<AllergenId, string> = {
  gluten: 'Gluten',
  crustaces: 'Crustacés',
  oeuf: 'Œufs',
  poisson: 'Poissons',
  soja: 'Soja',
  lait: 'Lait',
  'fruits-coque': 'Fruits à coque',
  sesame: 'Sésame',
  sulfites: 'Sulfites',
  mollusques: 'Mollusques',
};

/**
 * Illustration associée à un plat ou à un univers.
 * Chaque valeur correspond à un dessin de components/dishes/art.tsx. Ce sont
 * des illustrations assumées — jamais présentées comme des photographies.
 */
export type IllustrationKind =
  | 'salade'
  | 'sushi'
  | 'maki'
  | 'uramaki'
  | 'wok'
  | 'riz'
  | 'grill'
  | 'volaille'
  | 'mijote'
  | 'pizza'
  | 'pates'
  | 'fruits-de-mer'
  | 'poisson'
  | 'patisserie'
  | 'glace'
  | 'fruits'
  | 'confiserie'
  | 'boisson'
  | 'boisson-chaude';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  allergens?: AllergenId[];
  veggie?: boolean;
  /** Mis en avant dans les sélections de la page d'accueil */
  signature?: boolean;
  /** Chemin d'image dans /public/images. Prioritaire sur l'illustration. */
  image?: string | null;
  /** Illustration propre au plat ; à défaut, celle de sa catégorie. */
  illustration?: IllustrationKind;
};

export type MenuCategory = {
  id: string;
  /** Libellé court pour la navigation horizontale mobile */
  short: string;
  name: string;
  /** Phrase d'ambiance affichée en tête de catégorie */
  intro: string;
  /** Illustration par défaut de l'univers */
  illustration: IllustrationKind;
  /** Destination associée sur la carte du monde (id dans DESTINATIONS) */
  destinationId?: string;
  items: MenuItem[];
};

/**
 * DESTINATIONS — points lumineux de la carte du monde.
 * Chaque destination correspond à un univers RÉELLEMENT cité dans le buffet.
 * `code` est une signature graphique inspirée des panneaux d'aéroport ; il est
 * purement décoratif et ne désigne aucun aéroport réel.
 */
export type Destination = {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  /** Ce que l'on trouve à cette escale du buffet */
  highlights: string[];
  accent: 'aurora' | 'ember' | 'saffron' | 'plasma' | 'jade';
  /** Marqueur du restaurant lui-même */
  home?: boolean;
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'japon',
    name: 'Japon',
    code: 'JPN',
    lat: 35.68,
    lng: 139.69,
    highlights: ['Sushi', 'Maki', 'Riz vinaigré'],
    accent: 'aurora',
  },
  {
    id: 'asie',
    name: 'Asie',
    code: 'ASI',
    lat: 27.5,
    lng: 112.0,
    highlights: ['Wok', 'Nouilles sautées', 'Riz sauté'],
    accent: 'ember',
  },
  {
    id: 'italie',
    name: 'Italie',
    code: 'ITA',
    lat: 41.9,
    lng: 12.49,
    highlights: ['Pizza', 'Pâtes'],
    accent: 'saffron',
  },
  {
    id: 'mediterranee',
    name: 'Méditerranée',
    code: 'MED',
    lat: 31.63,
    lng: -7.99,
    highlights: ['Plats mijotés', 'Grillades'],
    accent: 'ember',
  },
  {
    id: 'haute-mer',
    name: 'Haute mer',
    code: 'MER',
    lat: 47.5,
    lng: -8.0,
    highlights: ['Fruits de mer', 'Poissons'],
    accent: 'plasma',
  },
  {
    id: 'patisserie',
    name: 'Pâtisserie',
    code: 'SUC',
    lat: 46.0,
    lng: 2.2,
    highlights: ['Pâtisseries', 'Glaces', 'Fruits frais'],
    accent: 'saffron',
  },
  {
    id: 'terminal',
    name: 'Val de Fontenay',
    code: 'GT94',
    lat: 48.8535,
    lng: 2.4823,
    highlights: ['Votre table'],
    accent: 'jade',
    home: true,
  },
];

export const MENU: MenuCategory[] = [
  {
    id: 'entrees',
    short: 'Entrées',
    illustration: 'salade',
    name: 'Entrées & salades',
    intro: "Le point de départ. Crudités, salades composées et hors-d'œuvre à assembler librement.",
    items: [
      {
        id: 'salades',
        name: 'Salades composées',
        description: 'Assortiment de salades préparées, à composer soi-même.',
        veggie: true,
      },
      { id: 'crudites', name: 'Crudités', description: 'Légumes frais découpés du jour.', veggie: true },
      {
        id: 'hors-doeuvre',
        name: "Hors-d'œuvre",
        description: "Assortiment d'entrées froides du buffet.",
      },
    ],
  },
  {
    id: 'sushi',
    short: 'Sushi',
    illustration: 'sushi',
    name: 'Sushi & maki',
    intro: 'Le comptoir japonais. Riz vinaigré, poissons et rouleaux préparés en continu.',
    destinationId: 'japon',
    items: [
      {
        id: 'sushi-assortiment',
        name: 'Sushi',
        description: 'Assortiment de sushi du buffet.',
        allergens: ['poisson', 'soja'],
        signature: true,
      },
      {
        id: 'maki', illustration: 'maki',
        name: 'Maki',
        description: "Rouleaux de riz et d'algue nori garnis.",
        allergens: ['poisson', 'soja', 'sesame'],
        signature: true,
      },
      {
        id: 'california', illustration: 'uramaki',
        name: 'Rouleaux californiens',
        description: "Rouleaux garnis, riz à l'extérieur.",
        allergens: ['poisson', 'soja', 'sesame'],
      },
      {
        id: 'accompagnements-sushi',
        name: 'Accompagnements',
        description: 'Sauce soja, gingembre, wasabi.',
        allergens: ['soja'],
        veggie: true,
      },
    ],
  },
  {
    id: 'wok',
    short: 'Wok',
    illustration: 'wok',
    name: 'Wok & plats asiatiques',
    intro: 'La cuisson vive. Nouilles, riz et légumes sautés au wok.',
    destinationId: 'asie',
    items: [
      {
        id: 'nouilles',
        name: 'Nouilles sautées',
        description: 'Nouilles sautées au wok et leurs légumes.',
        allergens: ['gluten', 'soja'],
        signature: true,
      },
      {
        id: 'riz-saute', illustration: 'riz',
        name: 'Riz sauté',
        description: 'Riz sauté du buffet.',
        allergens: ['oeuf', 'soja'],
      },
      {
        id: 'legumes-wok',
        name: 'Légumes au wok',
        description: 'Légumes sautés minute.',
        veggie: true,
        allergens: ['soja'],
      },
      {
        id: 'plats-asiatiques',
        name: 'Plats asiatiques',
        description: "Sélection de plats chauds d'inspiration asiatique.",
        allergens: ['soja'],
      },
    ],
  },
  {
    id: 'grillades',
    short: 'Grill',
    illustration: 'grill',
    name: 'Grillades',
    intro: 'Le feu. Viandes et brochettes grillées tout au long du service.',
    destinationId: 'mediterranee',
    items: [
      {
        id: 'viandes-grillees',
        name: 'Viandes grillées',
        description: 'Sélection de viandes grillées. Établissement halal.',
        signature: true,
      },
      { id: 'brochettes', name: 'Brochettes', description: 'Brochettes préparées et grillées.' },
      { id: 'volaille', illustration: 'volaille', name: 'Volaille', description: 'Volaille rôtie ou grillée.' },
    ],
  },
  {
    id: 'mijotes',
    short: 'Mijotés',
    illustration: 'mijote',
    name: 'Plats mijotés',
    intro: "La cuisson lente, entre Méditerranée et Afrique du Nord.",
    destinationId: 'mediterranee',
    items: [
      {
        id: 'mijotes-viande',
        name: 'Plats mijotés',
        description: 'Plats en sauce longuement cuisinés.',
        signature: true,
      },
      {
        id: 'accompagnements-chauds', illustration: 'riz',
        name: 'Accompagnements chauds',
        description: "Féculents et légumes d'accompagnement.",
        veggie: true,
      },
    ],
  },
  {
    id: 'italie',
    short: 'Italie',
    illustration: 'pizza',
    name: 'Pizza & pâtes',
    intro: "L'escale italienne. Pizzas cuites sur place et pâtes du jour.",
    destinationId: 'italie',
    items: [
      {
        id: 'pizza',
        name: 'Pizza',
        description: 'Pizzas préparées sur place.',
        allergens: ['gluten', 'lait'],
        signature: true,
      },
      {
        id: 'pates', illustration: 'pates',
        name: 'Pâtes',
        description: 'Pâtes et leurs sauces.',
        allergens: ['gluten'],
        veggie: true,
      },
    ],
  },
  {
    id: 'mer',
    short: 'Mer',
    illustration: 'fruits-de-mer',
    name: 'Fruits de mer',
    intro: 'Le banc de fruits de mer et ses préparations iodées.',
    destinationId: 'haute-mer',
    items: [
      {
        id: 'fruits-de-mer',
        name: 'Fruits de mer',
        description: 'Sélection de fruits de mer du buffet.',
        allergens: ['crustaces', 'mollusques'],
        signature: true,
      },
      {
        id: 'poissons', illustration: 'poisson',
        name: 'Poissons',
        description: 'Préparations à base de poisson.',
        allergens: ['poisson'],
      },
    ],
  },
  {
    id: 'desserts',
    short: 'Desserts',
    illustration: 'patisserie',
    name: 'Desserts, glaces & fruits',
    intro: 'La dernière escale. Pâtisseries, glaces, fruits frais et confiseries.',
    destinationId: 'patisserie',
    items: [
      {
        id: 'patisseries',
        name: 'Pâtisseries',
        description: 'Assortiment de gâteaux et pâtisseries.',
        allergens: ['gluten', 'oeuf', 'lait'],
        veggie: true,
        signature: true,
      },
      {
        id: 'glaces', illustration: 'glace',
        name: 'Glaces',
        description: 'Glaces et sorbets.',
        allergens: ['lait'],
        veggie: true,
      },
      { id: 'fruits', illustration: 'fruits', name: 'Fruits frais', description: 'Fruits frais découpés.', veggie: true },
      { id: 'confiseries', illustration: 'confiserie', name: 'Confiseries', description: 'Sélection de confiseries.', veggie: true },
    ],
  },
  {
    id: 'boissons',
    short: 'Boissons',
    illustration: 'boisson',
    name: 'Boissons',
    intro:
      "Fontaine à boissons du buffet. Plusieurs sources indiquent les boissons incluses le soir " +
      "et le week-end — information à confirmer auprès du restaurant.",
    items: [
      { id: 'softs', name: 'Boissons fraîches', description: 'Sélection de boissons sans alcool.', veggie: true },
      { id: 'chaudes', illustration: 'boisson-chaude', name: 'Boissons chaudes', description: 'Café, thé.', veggie: true },
    ],
  },
];

/** Filtres de la navigation horizontale du menu. */
export function menuFilters() {
  return [
    { id: 'tout', short: 'Tout', name: 'Tout le buffet' },
    ...MENU.map((c) => ({ id: c.id, short: c.short, name: c.name })),
  ];
}

export function findCategory(id: string): MenuCategory | undefined {
  return MENU.find((c) => c.id === id);
}

export function findDestination(id?: string): Destination | undefined {
  if (!id) return undefined;
  return DESTINATIONS.find((d) => d.id === id);
}

/** Plats signature, utilisés en page d'accueil. */
export function signatureItems(): { item: MenuItem; category: MenuCategory }[] {
  return MENU.flatMap((category) =>
    category.items.filter((i) => i.signature).map((item) => ({ item, category }))
  );
}

/**
 * Nombre d'univers culinaires — comptage RÉEL des catégories de ce fichier,
 * jamais une estimation. Les boissons ne comptent pas comme un univers.
 */
export function universeCount(): number {
  return MENU.filter((c) => c.id !== 'boissons').length;
}
