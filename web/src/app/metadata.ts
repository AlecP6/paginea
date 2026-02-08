import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr'),
  title: 'Paginea - Réseau Social Littéraire | Partagez vos Lectures',
  description: 'Rejoignez Paginea, le réseau social dédié aux passionnés de lecture. Partagez vos avis, découvrez de nouveaux livres, échangez avec des lecteurs et créez votre bibliothèque virtuelle.',
  keywords: [
    'réseau social littéraire',
    'communauté de lecteurs',
    'partage de lecture',
    'critiques de livres',
    'recommandations de livres',
    'bibliothèque virtuelle',
    'avis sur les livres',
    'découverte littéraire',
    'club de lecture en ligne',
    'paginea',
  ],
  authors: [{ name: 'Paginea' }],
  creator: 'Paginea',
  publisher: 'Paginea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Paginea - Réseau Social Littéraire',
    description: 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr',
    siteName: 'Paginea',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Logo Paginea',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paginea - Réseau Social Littéraire',
    description: 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.',
    images: ['/logo.png'],
    creator: '@paginea',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr',
  },
  category: 'Social Network',
}
