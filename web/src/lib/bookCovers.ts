/**
 * 📚 Utilities pour récupérer les couvertures de livres
 * 
 * Système hybride:
 * 1. Open Library (priorité) - Gratuit, sans quota
 * 2. Google Books (fallback) - Si Open Library ne trouve rien
 */

const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_COVERS_API = 'https://covers.openlibrary.org/b';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export interface BookCoverResult {
  coverUrl: string;
  source: 'open-library' | 'google-books' | 'none';
}

/**
 * Vérifie si une URL de couverture Open Library est valide (pas une image placeholder)
 * Open Library retourne une image 1x1px (~807 bytes) si la couverture n'existe pas
 */
async function validateOpenLibraryCover(coverUrl: string): Promise<boolean> {
  if (!coverUrl) return false;
  
  try {
    const response = await fetch(coverUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return false;

    // Vérifier la taille de l'image (placeholder Open Library = ~807 bytes)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) < 1000) {
      console.log(`⚠️  Couverture trop petite (${contentLength} bytes) - probablement un placeholder`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur validation couverture:', error);
    return false;
  }
}

/**
 * Recherche une couverture de livre par titre via Open Library
 */
export async function searchBookCoverByTitle(title: string): Promise<BookCoverResult> {
  try {
    const url = new URL(OPEN_LIBRARY_SEARCH_API);
    url.searchParams.set('title', title);
    url.searchParams.set('limit', '1');
    url.searchParams.set('fields', 'cover_i');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5 secondes
    });

    if (!response.ok) {
      throw new Error(`Open Library returned ${response.status}`);
    }

    const data = await response.json();

    if (data.docs && data.docs[0]?.cover_i) {
      const coverId = data.docs[0].cover_i;
      const coverUrl = `${OPEN_LIBRARY_COVERS_API}/id/${coverId}-M.jpg`;
      
      // Valider que ce n'est pas un placeholder
      const isValid = await validateOpenLibraryCover(coverUrl);
      if (isValid) {
        return {
          coverUrl,
          source: 'open-library',
        };
      }
    }

    return { coverUrl: '', source: 'none' };
  } catch (error) {
    console.error('❌ Erreur Open Library cover search:', error);
    return { coverUrl: '', source: 'none' };
  }
}

/**
 * Recherche une couverture de livre par ISBN via Open Library
 */
export async function searchBookCoverByISBN(isbn: string): Promise<BookCoverResult> {
  try {
    // Open Library supporte directement les ISBN dans l'URL des couvertures
    const coverUrl = `${OPEN_LIBRARY_COVERS_API}/isbn/${isbn}-M.jpg`;
    
    // Valider que l'image existe et n'est pas un placeholder
    const isValid = await validateOpenLibraryCover(coverUrl);
    
    if (isValid) {
      return {
        coverUrl,
        source: 'open-library',
      };
    }

    return { coverUrl: '', source: 'none' };
  } catch (error) {
    console.error('❌ Erreur Open Library ISBN cover:', error);
    return { coverUrl: '', source: 'none' };
  }
}

/**
 * Recherche une couverture via Google Books (fallback)
 */
export async function searchBookCoverViaGoogleBooks(title: string): Promise<BookCoverResult> {
  try {
    const url = new URL(GOOGLE_BOOKS_API);
    url.searchParams.set('q', title);
    url.searchParams.set('maxResults', '1');

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) {
      url.searchParams.set('key', apiKey);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Google Books returned ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items[0]?.volumeInfo?.imageLinks) {
      const imageLinks = data.items[0].volumeInfo.imageLinks;
      const coverUrl = (imageLinks.thumbnail || imageLinks.smallThumbnail || '')
        .replace('http://', 'https://');
      
      if (coverUrl) {
        return {
          coverUrl,
          source: 'google-books',
        };
      }
    }

    return { coverUrl: '', source: 'none' };
  } catch (error) {
    console.error('❌ Erreur Google Books cover search:', error);
    return { coverUrl: '', source: 'none' };
  }
}

/**
 * Recherche intelligente de couverture (essaie Open Library puis Google Books)
 */
export async function findBookCover(title: string, isbn?: string): Promise<BookCoverResult> {
  // 1. Essayer avec ISBN via Open Library (le plus fiable)
  if (isbn) {
    console.log(`🔍 Recherche couverture par ISBN: ${isbn}`);
    const isbnResult = await searchBookCoverByISBN(isbn);
    if (isbnResult.coverUrl) {
      console.log(`✅ Couverture trouvée via Open Library (ISBN)`);
      return isbnResult;
    }
  }

  // 2. Essayer avec titre via Open Library
  console.log(`🔍 Recherche couverture par titre: ${title}`);
  const titleResult = await searchBookCoverByTitle(title);
  if (titleResult.coverUrl) {
    console.log(`✅ Couverture trouvée via Open Library (titre)`);
    return titleResult;
  }

  // 3. Fallback: Google Books (si encore disponible)
  console.log(`🔍 Fallback: Recherche via Google Books`);
  const googleResult = await searchBookCoverViaGoogleBooks(title);
  if (googleResult.coverUrl) {
    console.log(`✅ Couverture trouvée via Google Books`);
    return googleResult;
  }

  console.log(`❌ Aucune couverture trouvée pour: ${title}`);
  return { coverUrl: '', source: 'none' };
}
