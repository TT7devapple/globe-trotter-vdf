/**
 * VISUELS
 * ==========================================================================
 * ⚠ LE SITE N'EMBARQUE AUCUNE PHOTOGRAPHIE, ET C'EST VOLONTAIRE.
 *
 * Aucune photo de Globe Trotter Val de Fontenay n'est libre de droits :
 * les clichés visibles sur Google, Instagram, TikTok ou les annuaires
 * appartiennent à leurs auteurs. Les publier sans autorisation exposerait le
 * restaurant à une réclamation. Des photos de banque d'images montrant
 * d'autres buffets seraient, elles, trompeuses pour le visiteur.
 *
 * En attendant les photos du restaurant, chaque emplacement affiche une
 * composition abstraite générée en CSS et SVG (composant components/Visual.tsx),
 * accordée à l'identité visuelle. Le site est ainsi présentable immédiatement,
 * sans rien affirmer de faux.
 *
 * ┌─ POUR AJOUTER LES VRAIES PHOTOS ───────────────────────────────────────┐
 * │ 1. Déposez les fichiers dans /public/images/ (format .webp ou .avif    │
 * │    de préférence, 1600 px de large suffisent).                         │
 * │ 2. Renseignez les chemins ci-dessous.                                  │
 * │ 3. C'est tout : chaque emplacement bascule automatiquement de la       │
 * │    composition générée vers la photographie.                           │
 * └────────────────────────────────────────────────────────────────────────┘
 */

import type { IllustrationKind } from './menu';

/** Photographie de fond du hero. Exemple : '/images/hero.webp' */
export const HERO_IMAGE: string | null = null;

/** Photographie de la section « Le buffet ». */
export const BUFFET_IMAGE: string | null = null;

export type GalleryEntry = {
  id: string;
  /** Texte alternatif — obligatoire, décrit la photo pour les lecteurs d'écran */
  alt: string;
  /** Chemin de la photo ; null = composition générée */
  src: string | null;
  /** Légende affichée au survol */
  caption: string;
  /** Teinte de la composition générée */
  accent: 'aurora' | 'ember' | 'saffron' | 'plasma' | 'jade';
  /** Illustration affichée en l'absence de photo (plats uniquement) */
  illustration?: IllustrationKind;
  /** Format dans la grille asymétrique */
  span: 'tall' | 'wide' | 'square' | 'large';
};

/**
 * GALERIE
 * Les emplacements sont définis, les photos manquent. Les légendes ne
 * décrivent que des univers confirmés par les sources publiques.
 */
export const GALLERY: GalleryEntry[] = [
  { id: 'salle', alt: 'Salle du restaurant Globe Trotter Val de Fontenay', src: null, caption: 'La salle', accent: 'plasma', span: 'large' },
  { id: 'sushi', illustration: 'sushi', alt: 'Comptoir à sushi du buffet', src: null, caption: 'Sushi & maki', accent: 'aurora', span: 'tall' },
  { id: 'grill', illustration: 'grill', alt: 'Poste de grillades du buffet', src: null, caption: 'Grillades', accent: 'ember', span: 'square' },
  { id: 'wok', illustration: 'wok', alt: 'Poste wok du buffet', src: null, caption: 'Wok', accent: 'ember', span: 'square' },
  { id: 'mer', illustration: 'fruits-de-mer', alt: 'Banc de fruits de mer du buffet', src: null, caption: 'Fruits de mer', accent: 'plasma', span: 'wide' },
  { id: 'pizza', illustration: 'pizza', alt: 'Pizzas préparées sur place', src: null, caption: 'Pizza & pâtes', accent: 'saffron', span: 'square' },
  { id: 'desserts', illustration: 'patisserie', alt: 'Buffet de desserts et pâtisseries', src: null, caption: 'Desserts', accent: 'saffron', span: 'tall' },
  { id: 'fruits', illustration: 'fruits', alt: 'Fruits frais découpés', src: null, caption: 'Fruits frais', accent: 'jade', span: 'square' },
  { id: 'facade', alt: 'Entrée du restaurant dans le centre commercial', src: null, caption: 'L’entrée', accent: 'aurora', span: 'wide' },
];

/** Vrai si au moins une vraie photographie est disponible. */
export function hasRealPhotos(): boolean {
  return GALLERY.some((entry) => entry.src !== null) || HERO_IMAGE !== null || BUFFET_IMAGE !== null;
}
