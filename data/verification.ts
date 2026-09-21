/**
 * REGISTRE DE VÉRIFICATION DES DONNÉES
 * ==========================================================================
 * Ce fichier est le garde-fou du site. Toute information publiée qui n'a pas
 * été confirmée par le restaurant lui-même doit être déclarée ici.
 *
 * Règle : une donnée `verified: false` n'est JAMAIS affichée comme un fait.
 * Le composant qui la consomme doit soit la masquer, soit la présenter
 * explicitement comme « à confirmer ».
 *
 * Quand le restaurant confirme une information :
 *   1. corrigez la valeur dans le fichier data/ concerné ;
 *   2. passez `verified` à true ci-dessous ;
 *   3. mettez `checkedOn` à la date du jour.
 */

export type VerificationEntry = {
  /** Ce que couvre l'entrée */
  label: string;
  verified: boolean;
  /** Pourquoi c'est incertain, et ce qu'il faut demander au restaurant */
  note: string;
  sources?: string[];
  checkedOn?: string;
};

export const VERIFICATION: Record<string, VerificationEntry> = {
  identity: {
    label: 'Nom, adresse, téléphone',
    verified: true,
    note: 'Concordant sur le site du centre commercial Aushopping, RestaurantGuru, Kazfeed et les annuaires.',
    sources: ['https://fontenay.aushopping.com/restaurants/globe-trotter-fr-fontenay'],
    checkedOn: '2026-09-20',
  },
  concept: {
    label: 'Concept : buffet à volonté, cuisine du monde, halal, fait maison',
    verified: true,
    note: 'Répété de façon concordante par plusieurs sources indépendantes.',
    checkedOn: '2026-09-20',
  },
  openingHours: {
    label: 'Horaires d’ouverture',
    verified: false,
    note:
      'SOURCES CONTRADICTOIRES. Trois versions circulent : 12h–15h / 19h–23h ; ' +
      '12h–14h30 / 19h–22h30 ; et 12h–22h30 en continu (fiche Aushopping). ' +
      'À FAIRE : faire trancher le restaurant, puis corriger data/openingHours.ts.',
    checkedOn: '2026-09-20',
  },
  pricing: {
    label: 'Tarifs des formules',
    verified: false,
    note:
      'AUCUN TARIF FIABLE POUR VAL DE FONTENAY. Les montants les plus diffusés ' +
      '(18,80 € / 25,80 €) concernent les établissements de Chelles et Bezons et ne ' +
      'doivent PAS être repris ici. Des valeurs contradictoires circulent pour Fontenay ' +
      '(19,80 € / ~25 € / 26,90 € / 28,90 €). Les prix restent masqués tant que le ' +
      'restaurant ne les a pas confirmés : voir data/formulas.ts.',
    checkedOn: '2026-09-20',
  },
  googleRating: {
    label: 'Note Google',
    verified: false,
    note:
      'CONTRADICTOIRE : 3,7/5 sur 760 avis (RestaurantGuru) contre 3,9/5 sur 641 avis ' +
      '(Kazfeed). Une note Google évolue en continu : elle ne doit pas être figée dans ' +
      'le code. Masquée par défaut, voir data/reviews.ts.',
    checkedOn: '2026-09-20',
  },
  dishCount: {
    label: '« Plus de 150 plats »',
    verified: false,
    note:
      'Chiffre repris par plusieurs agrégateurs, mais tous semblent dériver d’un même ' +
      'texte marketing de l’enseigne. Non affiché comme statistique chiffrée tant que le ' +
      'restaurant ne le confirme pas.',
    checkedOn: '2026-09-20',
  },
  cuisines: {
    label: 'Univers culinaires du buffet',
    verified: false,
    note:
      'Sushi, wok, grillades, pizza, pâtes, fruits de mer, salades, plats mijotés et ' +
      'desserts sont cités de façon concordante. En revanche la composition exacte de ' +
      'chaque univers (plats précis) n’est pas documentée publiquement : les listes de ' +
      'data/menu.ts sont volontairement génériques et doivent être validées.',
    checkedOn: '2026-09-20',
  },
  drinksIncluded: {
    label: 'Boissons incluses le soir et le week-end',
    verified: false,
    note: 'Mentionné par plusieurs sources mais jamais par une source officielle. À confirmer.',
    checkedOn: '2026-09-20',
  },
  social: {
    label: 'Comptes de réseaux sociaux officiels',
    verified: false,
    note:
      'TROIS comptes Instagram revendiquent l’établissement : @globetrotter_vdf (~10 k), ' +
      '@globetrotter_valdefontenay (~4,3 k) et @globe_trotter_fontenay_s_bois. ' +
      'Impossible de déterminer lequel est officiel sans le restaurant. Aucun lien n’est ' +
      'publié tant que ce n’est pas tranché : voir data/restaurant.ts → social.',
    checkedOn: '2026-09-20',
  },
  liveCooking: {
    label: 'Espaces de préparation devant le client (live cooking)',
    verified: false,
    note:
      'Un poste « wok » et un poste « grill » sont cités, ce qui suggère une préparation ' +
      'minute, mais rien ne le confirme explicitement. La section Live Cooking est donc ' +
      'DÉSACTIVÉE par défaut (voir FEATURES ci-dessous).',
    checkedOn: '2026-09-20',
  },
  photos: {
    label: 'Photographies de l’établissement',
    verified: false,
    note:
      'Aucune photo du restaurant n’est libre de droits. Le site n’embarque donc AUCUNE ' +
      'photographie : tous les visuels sont générés en CSS/SVG. Voir public/images/README.md ' +
      'pour la procédure de remplacement par les photos du restaurant.',
    checkedOn: '2026-09-20',
  },
};

/**
 * INTERRUPTEURS DE SECTIONS
 * Chaque section dont le contenu n'est pas vérifiable est désactivable ici
 * sans toucher au code des pages.
 */
export const FEATURES = {
  /** Affiche les tarifs chiffrés des formules. Passez à true APRÈS les avoir saisis. */
  showPrices: false,
  /** Affiche la note Google chiffrée. */
  showGoogleRating: false,
  /** Affiche des statistiques chiffrées (nombre de plats, de couverts…). */
  showNumericStats: false,
  /** Affiche la section « Live Cooking ». */
  showLiveCooking: false,
  /** Affiche les liens réseaux sociaux. */
  showSocialLinks: false,
  /** Affiche la bannière d'avertissement « données à confirmer » (utile en recette). */
  showDataBanner: true,
} as const;

/** Liste des points restant à confirmer, pour l'écran d'admin. */
export function pendingVerifications(): VerificationEntry[] {
  return Object.values(VERIFICATION).filter((entry) => !entry.verified);
}
