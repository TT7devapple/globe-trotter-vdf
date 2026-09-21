/**
 * FORMULES & TARIFS
 * ==========================================================================
 * ⚠ AUCUN TARIF N'EST AFFIRMÉ PAR CE SITE POUR L'INSTANT.
 *
 * Pourquoi : les montants les plus relayés en ligne (18,80 € le midi,
 * 25,80 € le soir) concernent les établissements Globe Trotter de CHELLES et
 * BEZONS, pas Val de Fontenay. Pour Val de Fontenay, les sources se
 * contredisent (19,80 € / ~25 € de moyenne / 26,90 € / 28,90 €).
 * Publier un prix faux sur un site de restaurant est un problème commercial
 * et juridique : tant que le restaurant n'a pas confirmé, rien n'est affiché.
 *
 * ┌─ POUR ACTIVER LES PRIX ────────────────────────────────────────────────┐
 * │ 1. Renseignez `price` (en euros) pour chaque formule ci-dessous.       │
 * │ 2. Ouvrez data/verification.ts et passez FEATURES.showPrices à true.   │
 * │ 3. Passez aussi VERIFICATION.pricing.verified à true.                  │
 * │ Les cartes afficheront alors les montants au lieu de l'invitation à    │
 * │ appeler. Aucun autre fichier n'est à modifier.                         │
 * └────────────────────────────────────────────────────────────────────────┘
 */

import type { ServiceId } from './openingHours';

export type Formula = {
  id: string;
  /** Nom affiché, ex. « Midi en semaine » */
  name: string;
  /** Code décoratif type panneau d'embarquement */
  code: string;
  /** Service concerné */
  service: ServiceId | 'both';
  /** Jours concernés, en clair */
  days: string;
  /** Plage horaire affichée */
  schedule: string;
  /**
   * Tarif en euros. `null` = NON CONFIRMÉ, rien ne sera affiché.
   * Ne mettez un nombre ici qu'après confirmation par le restaurant.
   */
  price: number | null;
  /** Unité affichée sous le prix */
  unit: string;
  /** Ce que comprend la formule — uniquement des éléments sourcés */
  includes: string[];
  /** Conditions et réserves */
  conditions?: string[];
  /** Mise en avant visuelle de la carte */
  featured?: boolean;
  accent: 'aurora' | 'ember' | 'saffron' | 'plasma';
};

export const FORMULAS: Formula[] = [
  {
    id: 'midi',
    name: 'Midi',
    code: 'GT-12',
    service: 'midi',
    days: 'Tous les jours',
    schedule: '12h00 – 15h00',
    price: null,
    unit: 'par personne',
    includes: [
      'Buffet à volonté, tous les univers ouverts',
      'Entrées, salades et crudités',
      'Sushi, maki et rouleaux',
      'Wok, grillades, pizza et pâtes',
      'Desserts, glaces et fruits frais',
    ],
    conditions: ['Tarif à confirmer auprès du restaurant.'],
    accent: 'aurora',
  },
  {
    id: 'soir',
    name: 'Soir',
    code: 'GT-19',
    service: 'soir',
    days: 'Tous les soirs',
    schedule: '19h00 – 23h00',
    price: null,
    unit: 'par personne',
    includes: [
      'Buffet à volonté, tous les univers ouverts',
      'Banc de fruits de mer',
      'Sushi, maki et rouleaux',
      'Grillades et plats mijotés',
      'Desserts, glaces et confiseries',
    ],
    conditions: [
      'Tarif à confirmer auprès du restaurant.',
      'Plusieurs sources indiquent les boissons incluses le soir — à confirmer.',
    ],
    featured: true,
    accent: 'ember',
  },
  {
    id: 'weekend',
    name: 'Week-end & jours fériés',
    code: 'GT-WE',
    service: 'both',
    days: 'Samedi, dimanche et jours fériés',
    schedule: 'Midi et soir',
    price: null,
    unit: 'par personne',
    includes: [
      'Buffet à volonté, formule complète',
      'Tous les univers du buffet ouverts',
      'Desserts, glaces et pâtisseries',
    ],
    conditions: [
      'Tarif à confirmer auprès du restaurant.',
      'Un tarif spécifique peut s’appliquer le week-end et les jours fériés.',
    ],
    accent: 'saffron',
  },
  {
    id: 'enfant',
    name: 'Enfant',
    code: 'GT-KID',
    service: 'both',
    days: 'Tous les jours',
    schedule: 'Midi et soir',
    price: null,
    unit: 'par enfant',
    includes: [
      'Accès complet au buffet',
      'Chaises hautes disponibles',
      'Desserts, glaces et confiseries',
    ],
    conditions: [
      'Tarif et tranche d’âge à confirmer auprès du restaurant.',
      'Le restaurant est indiqué comme proposant un menu enfant.',
    ],
    accent: 'plasma',
  },
];

/** Vrai si au moins une formule a un tarif renseigné. */
export function hasAnyPrice(): boolean {
  return FORMULAS.some((f) => typeof f.price === 'number');
}

/** Formate un prix en euros, format français. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

/**
 * Fourchette de prix pour schema.org (`priceRange`).
 * Retourne une valeur qualitative tant que rien n'est confirmé — schema.org
 * accepte « €€ », ce qui n'affirme aucun montant précis.
 */
export function schemaPriceRange(): string {
  const prices = FORMULAS.map((f) => f.price).filter((p): p is number => typeof p === 'number');
  if (prices.length === 0) return '€€';
  return `${Math.min(...prices)}€ - ${Math.max(...prices)}€`;
}
