import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/restaurant';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // L'administration et les API n'ont rien à faire dans un index.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
