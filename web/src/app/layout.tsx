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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr'),
  title: {
    default: 'Paginea - Réseau Social Littéraire | Partagez vos Lectures',
    template: '%s | Paginea'
  },
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
    'réseau social livres',
    'communauté littéraire',
    'lectures partagées',
  ],
  authors: [{ name: 'Paginea' }],
  creator: 'Paginea',
  publisher: 'Paginea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.paginea.fr',
    siteName: 'Paginea',
    title: 'Paginea - Réseau Social Littéraire',
    description: 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Logo Paginea - Réseau Social Littéraire',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paginea - Réseau Social Littéraire',
    description: 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.',
    images: ['/logo.png'],
    creator: '@paginea',
    site: '@paginea',
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
  category: 'Social Network',
  applicationName: 'Paginea',
  appleWebApp: {
    capable: true,
    title: 'Paginea',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#065f46" />
        <link rel="icon" href="/logo.png" />
        
        {/* Force le mode sombre avant le chargement */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9705213079025649"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <StructuredData type="WebSite" />
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            // Style par défaut pour tous les toasts
            style: {
              background: '#ffffff',
              color: '#000000',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontWeight: '500',
            },
            // Style pour les toasts de succès
            success: {
              style: {
                background: '#ffffff',
                color: '#000000',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            // Style pour les toasts d'erreur
            error: {
              style: {
                background: '#ffffff',
                color: '#000000',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            // Style pour les toasts de chargement
            loading: {
              style: {
                background: '#ffffff',
                color: '#000000',
              },
            },
            // Durée d'affichage
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}

