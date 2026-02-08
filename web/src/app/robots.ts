import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // Bloquer les routes API
          '/admin/',        // Bloquer le panel admin
          '/profile/',      // Bloquer les profils privés (sauf pages publiques)
          '/_next/',        // Bloquer les fichiers Next.js
          '/messages/',     // Bloquer les messages privés
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/messages/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/messages/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
