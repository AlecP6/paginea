import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  keywords?: string[];
  noindex?: boolean;
}

export default function SEO({
  title = 'Paginea - Réseau social littéraire',
  description = 'Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs sur Paginea.',
  image = '/logo.png',
  url = 'https://www.paginea.fr',
  type = 'website',
  author,
  publishedTime,
  keywords = ['livres', 'lecture', 'réseau social', 'littérature', 'bibliothèque', 'critiques de livres', 'recommandations', 'communauté', 'lecteurs'],
  noindex = false,
}: SEOProps) {
  const fullTitle = title.includes('Paginea') ? title : `${title} | Paginea`;
  const imageUrl = image.startsWith('http') ? image : `${url}${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Paginea" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@paginea" />

      {/* Article specific */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          <meta property="article:section" content="Littérature" />
          <meta property="article:tag" content={keywords.join(',')} />
        </>
      )}

      {/* Favicon & PWA */}
      <link rel="icon" href="/logo.png" />
      <link rel="apple-touch-icon" href="/logo.png" />
      <meta name="theme-color" content="#065f46" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Language */}
      <meta httpEquiv="content-language" content="fr" />
      <link rel="alternate" hrefLang="fr" href={url} />

      {/* Author & Publisher */}
      <meta name="author" content="Paginea" />
      <meta name="publisher" content="Paginea" />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
    </Head>
  );
}
