import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// ⚡ Forcer Node.js Runtime
export const runtime = 'nodejs';

// 🆕 OPEN LIBRARY API
const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_COVERS_API = 'https://covers.openlibrary.org/b';

export async function GET(
  request: NextRequest,
  { params }: { params: { isbn: string } }
) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { isbn } = params;

    if (!isbn) {
      return NextResponse.json(
        { error: 'L\'ISBN est requis' },
        { status: 400 }
      );
    }

    console.log(`🔍 [API] Recherche livre par ISBN: ${isbn}`);

    // Recherche par ISBN dans Open Library API
    const url = new URL(OPEN_LIBRARY_SEARCH_API);
    url.searchParams.set('isbn', isbn);
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,publisher,isbn,cover_i,language,number_of_pages_median,subject');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Paginea/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Open Library returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      console.log(`📚 [API] Livre non trouvé pour ISBN: ${isbn}`);
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }

    const doc = data.docs[0];
    console.log(`✅ [API] Livre trouvé: ${doc.title}`);

    // Récupérer l'URL de la couverture
    const coverUrl = doc.cover_i 
      ? `${OPEN_LIBRARY_COVERS_API}/id/${doc.cover_i}-M.jpg`
      : '';

    const book = {
      googleBooksId: doc.key || `ol-isbn-${isbn}`,
      openLibraryKey: doc.key,
      title: doc.title || '',
      authors: doc.author_name || [],
      author: (doc.author_name && doc.author_name[0]) || '',
      publisher: (doc.publisher && doc.publisher[0]) || '',
      publishedDate: doc.first_publish_year ? doc.first_publish_year.toString() : '',
      description: doc.subject ? doc.subject.slice(0, 5).join(' • ') : '',
      isbn: isbn,
      pageCount: doc.number_of_pages_median || 0,
      categories: doc.subject ? doc.subject.slice(0, 3) : [],
      language: (doc.language && doc.language[0]) || 'fr',
      coverImage: coverUrl,
      previewLink: doc.key ? `https://openlibrary.org${doc.key}` : '',
      infoLink: doc.key ? `https://openlibrary.org${doc.key}` : '',
    };

    return NextResponse.json(book);
    
  } catch (error: any) {
    console.error('❌ [API] Erreur recherche ISBN:', error.message);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'La recherche a pris trop de temps' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du livre' },
      { status: 500 }
    );
  }
}
