import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { RESTAURANT, SEO, SITE_URL, fullAddress } from '@/data/restaurant';
import { schemaOpeningHours } from '@/data/openingHours';
import { schemaPriceRange } from '@/data/formulas';
import { MENU } from '@/data/menu';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DataNotice from '@/components/DataNotice';

/**
 * Typographie — trois familles, chacune avec un rôle précis :
 *  • Space Grotesk : titres et chiffres. Géométrique, caractère marqué,
 *    chiffres très lisibles en grande taille.
 *  • Inter : textes courants. Neutre et lisible à petite taille.
 *  • JetBrains Mono : micro-labels, coordonnées, références. C'est elle qui
 *    porte le vocabulaire « instrument de bord ».
 * Toutes sont chargées en `display: swap` et limitées au sous-ensemble latin.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#05070D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO.title,
    template: `%s — ${SEO.siteName}`,
  },
  description: SEO.description,
  keywords: [...SEO.keywords],
  applicationName: SEO.siteName,
  authors: [{ name: SEO.siteName }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SEO.locale,
    url: SITE_URL,
    siteName: SEO.siteName,
    title: SEO.title,
    description: SEO.description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SEO.siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'restaurant',
};

/**
 * Données structurées Schema.org.
 * Attention : `aggregateRating` est volontairement ABSENT. Publier une note
 * agrégée non vérifiée dans des données structurées expose à une pénalité
 * Google. Voir data/reviews.ts.
 */
function restaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: RESTAURANT.legalName,
    description: SEO.description,
    url: SITE_URL,
    telephone: RESTAURANT.phone.tel,
    priceRange: schemaPriceRange(),
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Espèces, Carte bancaire, Titres-restaurant',
    servesCuisine: ['Buffet', 'Cuisine du monde', 'Japonaise', 'Asiatique', 'Italienne', 'Méditerranéenne'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${RESTAURANT.address.venue}, ${RESTAURANT.address.street}`,
      postalCode: RESTAURANT.address.postalCode,
      addressLocality: RESTAURANT.address.city,
      addressRegion: RESTAURANT.address.region,
      addressCountry: RESTAURANT.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: RESTAURANT.geo.lat,
      longitude: RESTAURANT.geo.lng,
    },
    openingHoursSpecification: schemaOpeningHours(),
    acceptsReservations: `${SITE_URL}/reserver`,
    isAccessibleForFree: false,
    publicAccess: true,
    amenityFeature: RESTAURANT.services.map((service) => ({
      '@type': 'LocationFeatureSpecification',
      name: service.label,
      value: true,
    })),
    hasMenu: {
      '@type': 'Menu',
      '@id': `${SITE_URL}/menu`,
      name: 'Buffet à volonté',
      url: `${SITE_URL}/menu`,
      hasMenuSection: MENU.map((category) => ({
        '@type': 'MenuSection',
        name: category.name,
        description: category.intro,
        hasMenuItem: category.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.veggie ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
        })),
      })),
    },
  };
}

function breadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Le buffet', item: `${SITE_URL}/menu` },
      { '@type': 'ListItem', position: 3, name: 'Formules', item: `${SITE_URL}/formules` },
      { '@type': 'ListItem', position: 4, name: 'Réserver', item: `${SITE_URL}/reserver` },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // Données structurées : contenu contrôlé, généré depuis /data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
        />
      </head>
      <body className="min-h-dvh bg-void">
        {/* Lien d'évitement — premier élément focalisable de la page */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:rounded-full focus:bg-ember focus:px-5 focus:py-3 focus:font-mono
                     focus:text-micro focus:uppercase focus:text-void"
        >
          Aller au contenu
        </a>

        <DataNotice />
        <Header />
        <main id="contenu">{children}</main>
        <Footer />

        {/* Adresse en clair pour les moteurs et les lecteurs d'écran */}
        <span className="sr-only">
          {RESTAURANT.legalName}, {fullAddress()}. Téléphone : {RESTAURANT.phone.display}.
        </span>
      </body>
    </html>
  );
}
