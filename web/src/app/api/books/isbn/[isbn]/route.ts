import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

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

    // Recherche par ISBN dans Google Books API
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: `isbn:${isbn}`,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }

    const item = response.data.items[0];
    const volumeInfo = item.volumeInfo;

    const book = {
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

    return NextResponse.json(book);
  } catch (error: any) {
    console.error('Google Books ISBN search error:', error.message);
    if (error.response) {
      return NextResponse.json(
        {
          error: 'Erreur lors de la recherche du livre',
          details: error.response.data,
        },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du livre' },
      { status: 500 }
    );
  }
}

