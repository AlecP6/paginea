import type { Metadata } from 'next'
import { Inter, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import StructuredData from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })
const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script'
})

export const metadata: Metadata = {
  title: {
    default: 'Paginea - Réseau Social de Lecture',
    template: '%s | Paginea'
  },
  description: 'Partagez vos lectures, vos avis et découvrez de nouveaux livres avec vos amis. Rejoignez la communauté de lecteurs passionnés sur Paginea.',
  keywords: ['livres', 'lecture', 'réseau social', 'critiques livres', 'avis livres', 'bibliothèque', 'lecteurs', 'recommandations livres', 'Paginea'],
  authors: [{ name: 'Santa' }],
  creator: 'Santa',
  publisher: 'Paginea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Paginea',
    title: 'Paginea - Réseau Social de Lecture',
    description: 'Partagez vos lectures, vos avis et découvrez de nouveaux livres avec vos amis. Rejoignez la communauté de lecteurs passionnés.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Logo Paginea',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paginea - Réseau Social de Lecture',
    description: 'Partagez vos lectures, vos avis et découvrez de nouveaux livres avec vos amis.',
    images: ['/logo.png'],
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
  verification: {
    // google: 'votre-code-verification-google',
    // yandex: 'votre-code-verification-yandex',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9705213079025649"
          crossOrigin="anonymous"
        />
      </head>
        <meta name="theme-color" content="#065f46" />
        <link rel="icon" href="/logo.png" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9705213079025649"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <StructuredData type="WebSite" />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

