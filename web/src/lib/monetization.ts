/**
 * 🛒 Utilitaires Amazon Affiliate
 * 
 * Génération de liens Amazon optimisés pour la monétisation
 */

// 🔑 ID Partenaire Amazon
// Configuré avec l'ID du Programme Partenaires Amazon
// Inscription : https://partenaires.amazon.fr
export const AMAZON_AFFILIATE_ID = 'pagineaxsanta-21'; // ✅ Configuré

/**
 * Nettoie un titre de livre pour la recherche Amazon
 * - Supprime "livre" à la fin
 * - Supprime les mots superflus (tome, volume, etc. si seuls)
 * - Garde uniquement titre + auteur
 * - Encode correctement pour URL
 */
export function cleanBookTitleForSearch(title: string, author?: string): string {
  let cleanTitle = title.trim();
  
  // Supprimer "livre" à la fin (insensible à la casse)
  cleanTitle = cleanTitle.replace(/\s+livre\s*$/i, '');
  
  // Supprimer les parenthèses et leur contenu (ex: "(Poche)", "(Broché)")
  cleanTitle = cleanTitle.replace(/\s*\([^)]*\)\s*/g, ' ');
  
  // Supprimer les crochets et leur contenu (ex: "[Édition collector]")
  cleanTitle = cleanTitle.replace(/\s*\[[^\]]*\]\s*/g, ' ');
  
  // Supprimer les doubles espaces
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  
  // Ajouter l'auteur si fourni (améliore la précision)
  if (author) {
    const cleanAuthor = author.trim();
    // Ne pas ajouter l'auteur s'il est déjà dans le titre
    if (!cleanTitle.toLowerCase().includes(cleanAuthor.toLowerCase())) {
      cleanTitle = `${cleanTitle} ${cleanAuthor}`;
    }
  }
  
  return cleanTitle;
}

/**
 * Génère un lien Amazon optimisé avec affiliation
 * 
 * @param title - Titre du livre
 * @param author - Auteur du livre (optionnel mais recommandé)
 * @param isbn - ISBN du livre (optionnel, meilleure précision)
 * @returns URL Amazon avec tag d'affiliation
 */
export function getAmazonAffiliateLink(
  title: string,
  author?: string,
  isbn?: string
): string {
  // Si ISBN disponible, recherche directe par ISBN (plus précis)
  if (isbn && isbn.length >= 10) {
    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    return `https://www.amazon.fr/dp/${cleanISBN}?tag=${AMAZON_AFFILIATE_ID}`;
  }
  
  // Sinon, recherche par titre + auteur
  const searchQuery = cleanBookTitleForSearch(title, author);
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // Recherche dans la catégorie "Livres" uniquement
  return `https://www.amazon.fr/s?k=${encodedQuery}&i=stripbooks&tag=${AMAZON_AFFILIATE_ID}`;
}

/**
 * Génère un lien Amazon depuis un objet livre
 */
export function getAmazonLinkFromBook(book: {
  title: string;
  author?: string;
  bookAuthor?: string;
  isbn?: string;
  bookIsbn?: string;
}): string {
  const title = book.title || '';
  const author = book.author || book.bookAuthor || '';
  const isbn = book.isbn || book.bookIsbn || '';
  
  return getAmazonAffiliateLink(title, author, isbn);
}

/**
 * Génère un lien Amazon depuis une review
 */
export function getAmazonLinkFromReview(review: {
  bookTitle: string;
  bookAuthor?: string;
  bookIsbn?: string;
}): string {
  return getAmazonAffiliateLink(
    review.bookTitle,
    review.bookAuthor,
    review.bookIsbn
  );
}

/**
 * Configuration AdSense
 */
export const ADSENSE_CONFIG = {
  // Client ID Google AdSense
  // Configuré avec l'ID du compte AdSense
  // Dashboard : https://www.google.com/adsense
  clientId: 'ca-pub-9705213079025649', // ✅ Configuré
  
  // Formats de pubs recommandés
  formats: {
    // Bannière horizontale (en-tête/pied de page)
    banner: {
      format: 'auto',
      responsive: true,
      style: { display: 'block', minHeight: '90px' },
    },
    
    // Rectangle moyen (sidebar)
    rectangle: {
      format: 'rectangle',
      responsive: true,
      style: { display: 'block', minHeight: '250px' },
    },
    
    // Grand rectangle (contenu)
    largeRectangle: {
      format: 'auto',
      responsive: true,
      style: { display: 'block', minHeight: '280px' },
    },
    
    // In-feed (dans le flux de contenu)
    inFeed: {
      format: 'fluid',
      responsive: true,
      style: { display: 'block', minHeight: '200px' },
    },
  },
  
  // Emplacements stratégiques recommandés
  placements: {
    // Conversion élevée
    highValue: [
      'Après formulaire d\'ajout de livre',
      'Entre les critiques de livres',
      'Sidebar page bookstore',
      'Fin de page dashboard',
    ],
    
    // Conversion moyenne
    mediumValue: [
      'En-tête de page',
      'Pied de page',
      'Entre les posts',
    ],
  },
};
