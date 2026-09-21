# Photographies

Ce dossier est **volontairement vide**.

Aucune photo de Globe Trotter Val de Fontenay n'est libre de droits : les
clichés visibles sur Google, Instagram, TikTok ou les annuaires appartiennent à
leurs auteurs. Les publier sans autorisation exposerait le restaurant à une
réclamation. Utiliser des photos de banque d'images montrant d'autres buffets
serait, de son côté, trompeur pour le visiteur.

En attendant, chaque emplacement affiche une composition abstraite générée en
CSS et SVG (`components/Visual.tsx`), accordée à l'identité visuelle du site.

## Ajouter les vraies photos

1. Déposez les fichiers ici, de préférence en `.webp` ou `.avif` ; 1600 px de
   large suffisent (le site ne les affiche jamais au-delà de 1200 px).
2. Renseignez les chemins dans `data/images.ts` :
   - `HERO_IMAGE` — fond de la page d'accueil (paysage, sujet centré) ;
   - `BUFFET_IMAGE` — section « Le buffet » (format 4/3) ;
   - `GALLERY[].src` — un chemin par entrée de la galerie.
3. Vérifiez le texte alternatif (`alt`) de chaque entrée : il décrit la photo
   pour les personnes utilisant un lecteur d'écran, et compte pour le
   référencement.

Aucune autre modification n'est nécessaire : chaque emplacement bascule
automatiquement de la composition générée vers la photographie.

## Photos recommandées, par ordre d'utilité

| Priorité | Sujet | Emplacement |
|---|---|---|
| 1 | Vue large du buffet en service | `HERO_IMAGE` |
| 2 | Le buffet, plans rapprochés | `BUFFET_IMAGE` |
| 3 | Comptoir à sushi | galerie `sushi` |
| 4 | Poste grillades | galerie `grill` |
| 5 | Salle et ambiance du soir | galerie `salle` |
| 6 | Buffet de desserts | galerie `desserts` |
| 7 | Entrée du restaurant dans la galerie marchande | galerie `facade` |

## Conseil de prise de vue

Le site est sombre. Des photos prises **en lumière chaude, avec des noirs
profonds** s'y intègrent naturellement ; des photos très claires et plates
jureront avec l'interface. Photographier le buffet en début de service, quand
il est complet et net, donne le meilleur résultat.
