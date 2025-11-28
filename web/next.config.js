/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactiver ESLint pendant le build pour éviter les erreurs de compatibilité
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Continuer le build même en cas d'erreurs TypeScript (optionnel)
    ignoreBuildErrors: false,
  },
  // Optimisation des images
  images: {
    domains: ['localhost', 'books.google.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Compression
  compress: true,
  // Optimisation du bundle
  swcMinify: true,
  // Production source maps (désactivé pour la performance)
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache pour les assets statiques
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pour les images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

