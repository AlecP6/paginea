import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

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
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        maxResults: 10,
        printType: 'books',
        langRestrict: 'fr',
      },
    });

    const books = response.data.items?.map((item: any) => {
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
    }) || [];

    return NextResponse.json(books);
  } catch (error: any) {
    console.error('Google Books search error:', error.message);
    if (error.response) {
      return NextResponse.json(
        {
          error: 'Erreur lors de la recherche de livres',
          details: error.response.data,
        },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de livres' },
      { status: 500 }
    );
  }
}
