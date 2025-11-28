/**
 * Fonction utilitaire pour obtenir l'URL complète d'une image
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // Si c'est déjà une URL complète (http/https), on la retourne telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Sinon, on construit l'URL avec le site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${siteUrl}${imageUrl}`;
}

