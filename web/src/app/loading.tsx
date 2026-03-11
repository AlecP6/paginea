import PageLoader from '@/components/PageLoader';

export default function Loading() {
  // ⚠️ PAS D'ANNONCES sur cette page (conformité Google Ads)
  // Page de chargement temporaire = "contenu comportemental" interdit par Google
  return <PageLoader />;
}
