import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// ⚡ IMPORTANT: Forcer Node.js Runtime
export const runtime = 'nodejs';

// 🆕 OPEN LIBRARY API - Gratuit, sans quota, fiable
const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_COVERS_API = 'https://covers.openlibrary.org/b';

/**
 * Récupère l'URL de couverture depuis Open Library
 */
function getCoverUrl(coverId: number | null, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!coverId) return '';
  return `${OPEN_LIBRARY_COVERS_API}/id/${coverId}-${size}.jpg`;
}

/**
 * Extrait le premier ISBN-13 ou ISBN-10 disponible
 */
function extractISBN(isbns: string[] | undefined): string {
  if (!isbns || isbns.length === 0) return '';
  
  // Préférer ISBN-13 (commence par 978 ou 979)
  const isbn13 = isbns.find(isbn => isbn.length === 13 && (isbn.startsWith('978') || isbn.startsWith('979')));
  if (isbn13) return isbn13;
  
  // Sinon prendre ISBN-10
  const isbn10 = isbns.find(isbn => isbn.length === 10);
  if (isbn10) return isbn10;
  
  // Sinon le premier disponible
  return isbns[0] || '';
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    // Récupérer le paramètre de recherche
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Veuillez entrer au moins 2 caractères pour la recherche' },
        { status: 400 }
      );
    }

    console.log(`🔍 [API] Recherche Open Library pour: "${query}"`);

    // Appel à Open Library API
    const url = new URL(OPEN_LIBRARY_SEARCH_API);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '15');
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,publisher,isbn,cover_i,language,number_of_pages_median,subject');
    url.searchParams.set('lang', 'fr');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Paginea/1.0 (Reading community platform)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📊 [API] Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ [API] Open Library erreur: ${response.status}`);
      throw new Error(`Open Library API returned ${response.status}`);
    }

    const data = await response.json();

    // Vérifier si des résultats existent
    if (!data || !data.docs || data.docs.length === 0) {
      console.log('📚 [API] Aucun résultat trouvé');
      return NextResponse.json([]);
    }

    console.log(`✅ [API] ${data.docs.length} livre(s) trouvé(s)`);

    // Formater les résultats pour correspondre au format attendu
    const books = data.docs
      .filter((doc: any) => doc.title && doc.author_name) // Filtrer les livres sans titre ou auteur
      .slice(0, 10) // Limiter à 10 résultats
      .map((doc: any) => {
        const isbn = extractISBN(doc.isbn);
        const coverUrl = getCoverUrl(doc.cover_i, 'M');
        
        return {
          // ID unique (utiliser la clé Open Library)
          googleBooksId: doc.key || `ol-${doc.cover_i || Math.random()}`,
          openLibraryKey: doc.key,
          
          // Informations de base
          title: doc.title || 'Titre inconnu',
          authors: doc.author_name || [],
          author: (doc.author_name && doc.author_name[0]) || 'Auteur inconnu',
          
          // Publication
          publisher: (doc.publisher && doc.publisher[0]) || '',
          publishedDate: doc.first_publish_year ? doc.first_publish_year.toString() : '',
          
          // Description (Open Library ne fournit pas de description dans search, on met un placeholder)
          description: doc.subject ? doc.subject.slice(0, 5).join(' • ') : '',
          
          // ISBN
          isbn: isbn,
          
          // Détails
          pageCount: doc.number_of_pages_median || 0,
          categories: doc.subject ? doc.subject.slice(0, 3) : [],
          language: (doc.language && doc.language[0]) || 'fr',
          
          // Images et liens
          coverImage: coverUrl,
          previewLink: doc.key ? `https://openlibrary.org${doc.key}` : '',
          infoLink: doc.key ? `https://openlibrary.org${doc.key}` : '',
        };
      });

    return NextResponse.json(books);

  } catch (error: any) {
    console.error('❌ [API] Erreur recherche Open Library:', error.message);
    
    // Gestion des timeouts
    if (error.name === 'AbortError') {
      console.error('⏱️  [API] Timeout de la requête');
      return NextResponse.json(
        { error: 'La recherche a pris trop de temps. Réessayez.' },
        { status: 408 }
      );
    }
    
    console.error('❌ [API] Erreur non gérée:', error);
    
    return NextResponse.json(
      { 
        error: 'Impossible de rechercher des livres pour le moment',
        message: 'Erreur serveur - Réessayez dans quelques instants',
      },
      { status: 500 }
    );
  }
}
