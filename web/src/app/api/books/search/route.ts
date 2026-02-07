import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Le paramètre "query" est requis' },
        { status: 400 }
      );
    }

    // Recherche dans Google Books API
    const params: any = {
      q: query,
      maxResults: 10,
      printType: 'books',
      langRestrict: 'fr',
    };

    // Ajouter la clé API si disponible
    if (GOOGLE_API_KEY) {
      params.key = GOOGLE_API_KEY;
    }

    const response = await axios.get(GOOGLE_BOOKS_API, {
      params,
      timeout: 10000, // 10 secondes timeout
    });

    // Vérifier si l'API a retourné des résultats
    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json([]);
    }

    const books = response.data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo;
      
      return {
        googleBooksId: item.id,
        title: volumeInfo.title || '',
        authors: volumeInfo.authors || [],
        author: volumeInfo.authors?.[0] || '',
        publisher: volumeInfo.publisher || '',
        publishedDate: volumeInfo.publishedDate || '',
        description: volumeInfo.description || '',
        isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
              volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier ||
              '',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || [],
        language: volumeInfo.language || '',
        coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                    volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
                    '',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || '',
      };
    });

    return NextResponse.json(books);
  } catch (error: any) {
    console.error('Google Books search error:', error.message);
    
    // Gestion spécifique des erreurs
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'La recherche a pris trop de temps. Réessayez.' },
        { status: 408 }
      );
    }
    
    if (error.response) {
      console.error('Google Books API response error:', error.response.data);
      
      // Erreur 429 = limite de requêtes dépassée
      if (error.response.status === 429) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez patienter quelques instants.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Erreur lors de la recherche de livres',
          details: error.response.data,
        },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion à Google Books. Réessayez plus tard.' },
      { status: 500 }
    );
  }
}

