import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

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

    console.log(`🔍 Recherche Google Books pour: "${query}"`);

    // Appel à Google Books API
    const url = new URL(GOOGLE_BOOKS_API);
    url.searchParams.append('q', query);
    url.searchParams.append('maxResults', '10');
    url.searchParams.append('printType', 'books');
    url.searchParams.append('langRestrict', 'fr');
    
    // Ajouter la clé API si disponible
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) {
      url.searchParams.append('key', apiKey);
      console.log('🔑 Utilisation de la clé API Google Books');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes timeout

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ Google Books API erreur: ${response.status}`);
        throw new Error(`Google Books API returned ${response.status}`);
      }

      const data = await response.json();

      // Vérifier si des résultats existent
      if (!data.items || data.items.length === 0) {
        console.log('📚 Aucun résultat trouvé');
        return NextResponse.json([]);
      }

      console.log(`✅ ${data.items.length} livres trouvés`);

      // Formater les résultats
      const books = data.items.map((item: any) => {
        const info = item.volumeInfo || {};
        
        return {
          googleBooksId: item.id || '',
          title: info.title || 'Titre inconnu',
          authors: info.authors || [],
          author: (info.authors && info.authors[0]) || 'Auteur inconnu',
          publisher: info.publisher || '',
          publishedDate: info.publishedDate || '',
          description: info.description || '',
          isbn: 
            (info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier) ||
            (info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier) ||
            '',
          pageCount: info.pageCount || 0,
          categories: info.categories || [],
          language: info.language || 'fr',
          coverImage: 
            (info.imageLinks?.thumbnail || '')
              .replace('http://', 'https://') ||
            (info.imageLinks?.smallThumbnail || '')
              .replace('http://', 'https://') ||
            '',
          previewLink: info.previewLink || '',
          infoLink: info.infoLink || '',
        };
      });

      return NextResponse.json(books);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ Timeout de la requête Google Books');
        return NextResponse.json(
          { error: 'La recherche a pris trop de temps. Réessayez.' },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('❌ Erreur recherche Google Books:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Impossible de rechercher des livres pour le moment',
        message: 'Vérifiez votre connexion ou réessayez plus tard',
      },
      { status: 500 }
    );
  }
}
