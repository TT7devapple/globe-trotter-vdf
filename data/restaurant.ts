/**
 * IDENTITÉ DE L'ÉTABLISSEMENT
 * Source unique de vérité pour le nom, l'adresse, les contacts et le SEO.
 */

export const RESTAURANT = {
  name: 'Globe Trotter',
  location: 'Val de Fontenay',
  legalName: 'Globe Trotter Val de Fontenay',
  /** Code « aéroport » fictif utilisé comme signature graphique. */
  terminalCode: 'GT94',
  tagline: 'Buffet à volonté — cuisine du monde',
  claim: 'Le monde dans votre assiette.',

  address: {
    venue: 'Centre Commercial Auchan Val de Fontenay',
    street: 'Avenue du Maréchal Joffre',
    postalCode: '94120',
    city: 'Fontenay-sous-Bois',
    region: 'Île-de-France',
    country: 'France',
    countryCode: 'FR',
  },

  /** Coordonnées approximatives du centre commercial (affichage décoratif + carte). */
  geo: { lat: 48.8535, lng: 2.4823 },

  phone: { display: '01 41 81 07 44', tel: '+33141810744' },

  /**
   * E-mail de réception des demandes de réservation.
   * Renseignez RESERVATION_EMAIL dans .env pour activer les notifications.
   */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,

  /**
   * Réseaux sociaux — VOLONTAIREMENT VIDE.
   * Trois comptes Instagram revendiquent l'établissement (voir data/verification.ts).
   * Renseignez uniquement le compte officiel confirmé par le restaurant, puis
   * passez FEATURES.showSocialLinks à true.
   */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },

  /** Liens externes vérifiés. */
  links: {
    mall: 'https://fontenay.aushopping.com/restaurants/globe-trotter-fr-fontenay',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent('Globe Trotter, Centre Commercial Auchan Val de Fontenay, 94120 Fontenay-sous-Bois'),
    googleReviews:
      'https://www.google.com/search?q=' +
      encodeURIComponent('Globe Trotter Val de Fontenay avis') +
      '#lrd=0x0:0x0,1',
  },

  /**
   * Services confirmés par des sources concordantes.
   * `note` apparaît en info-bulle / texte secondaire.
   */
  services: [
    { id: 'buffet', label: 'Buffet à volonté', note: 'Midi et soir, 7 jours sur 7' },
    { id: 'halal', label: 'Halal', note: 'Établissement certifié halal' },
    { id: 'veggie', label: 'Options végétariennes', note: 'Salades, pâtes, légumes, desserts' },
    { id: 'groups', label: 'Groupes & salle privative', note: 'Anniversaires, repas d’entreprise' },
    { id: 'family', label: 'Espace familial', note: 'Chaises hautes disponibles' },
    { id: 'pmr', label: 'Accès PMR', note: 'Établissement accessible en fauteuil roulant' },
    { id: 'parking', label: 'Parking du centre', note: 'Parking du centre commercial' },
    { id: 'tickets', label: 'Titres-restaurant', note: 'Edenred, Pluxee, Up Déjeuner, Bimpli' },
  ],

  /** Capacité réservable EN LIGNE par service. Volontairement prudente. */
  onlineCapacity: {
    /**
     * Nombre de couverts que le site accepte de pré-réserver par service.
     * Ce n'est PAS la capacité réelle du restaurant (inconnue) : c'est un
     * plafond de sécurité pour éviter la surréservation. Ajustable en admin
     * via CapacityOverride, ou globalement ici.
     */
    defaultSeatsPerService: 60,
    /** Taille de groupe au-delà de laquelle on demande d'appeler. */
    maxPartySizeOnline: 10,
    /** Délai minimum entre la demande et le repas, en heures. */
    minLeadTimeHours: 2,
    /** Horizon maximum de réservation, en jours. */
    maxAdvanceDays: 90,
  },
} as const;

export const SEO = {
  siteName: 'Globe Trotter Val de Fontenay',
  title: 'Globe Trotter Val de Fontenay — Buffet à volonté, cuisine du monde',
  shortTitle: 'Globe Trotter Val de Fontenay',
  description:
    'Buffet à volonté à Fontenay-sous-Bois : sushi, wok, grillades, pizza, fruits de mer et desserts. ' +
    'Globe Trotter, Centre Commercial Auchan Val de Fontenay (94120). Ouvert 7j/7, midi et soir. Réservation en ligne.',
  keywords: [
    'Globe Trotter Val de Fontenay',
    'Globe Trotter Fontenay',
    'buffet à volonté Fontenay-sous-Bois',
    'buffet à volonté Val de Fontenay',
    'restaurant buffet Fontenay',
    'restaurant asiatique Fontenay-sous-Bois',
    'restaurant Auchan Val de Fontenay',
    'buffet halal 94',
    'restaurant 94120',
  ],
  locale: 'fr_FR',
} as const;

/** URL canonique du site. Définissez NEXT_PUBLIC_SITE_URL en production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function fullAddress(): string {
  const a = RESTAURANT.address;
  return `${a.venue}, ${a.postalCode} ${a.city}`;
}
