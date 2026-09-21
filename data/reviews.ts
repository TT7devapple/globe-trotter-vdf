/**
 * AVIS CLIENTS
 * ==========================================================================
 * ⚠ CE FICHIER EST VIDE, ET C'EST VOLONTAIRE.
 *
 * Aucun témoignage n'a été inventé. Reproduire des avis Google sur un site
 * commercial sans l'accord de leurs auteurs pose par ailleurs un problème de
 * droit d'auteur et de conditions d'utilisation de Google.
 *
 * La section « Ils ont voyagé avec nous » affiche donc, tant que ce tableau
 * est vide, un renvoi direct vers les avis Google plutôt qu'une sélection
 * d'avis choisis. C'est plus honnête, et plus crédible pour le visiteur.
 *
 * ┌─ POUR AJOUTER DES AVIS ────────────────────────────────────────────────┐
 * │ N'ajoutez ici que des avis dont vous avez recueilli l'accord écrit,    │
 * │ ou des avis déposés directement sur votre site.                        │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * NOTE GOOGLE : les sources se contredisent (3,7/5 sur 760 avis contre
 * 3,9/5 sur 641 avis) et une note évolue en continu. Elle est donc masquée
 * par défaut. Pour l'afficher, renseignez GOOGLE_RATING ci-dessous ET passez
 * FEATURES.showGoogleRating à true dans data/verification.ts.
 */

export type Review = {
  id: string;
  author: string;
  /** Note sur 5 */
  rating: number;
  /** Texte de l'avis, non retouché */
  text: string;
  /** Date au format "YYYY-MM" */
  date: string;
  /** Origine de l'avis */
  source: 'google' | 'site' | 'autre';
  /** Confirme que l'auteur a autorisé la publication sur le site */
  consentGiven: boolean;
};

/** Avis publiés sur le site. Vide tant qu'aucun consentement n'a été recueilli. */
export const REVIEWS: Review[] = [];

/**
 * Note Google agrégée.
 * `null` = non affichée. Ne renseignez ces valeurs qu'au moment de la mise en
 * ligne, en relevant la note réelle sur la fiche Google du restaurant.
 */
export const GOOGLE_RATING: { value: number; count: number; checkedOn: string } | null = null;

/** Avis effectivement publiables (consentement recueilli). */
export function publishableReviews(): Review[] {
  return REVIEWS.filter((r) => r.consentGiven);
}
