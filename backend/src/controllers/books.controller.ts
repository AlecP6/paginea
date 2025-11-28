import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';
import prisma from '../utils/prisma';

// Google Books API endpoint
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Le paramètre "query" est requis' });
    }

    // Recherche dans Google Books API
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        maxResults: 10,
        printType: 'books',
        langRestrict: 'fr', // Privilégier les livres en français
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

    res.json(books);
  } catch (error: any) {
    console.error('Google Books search error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erreur lors de la recherche de livres',
        details: error.response.data,
      });
    }
    res.status(500).json({ error: 'Erreur lors de la recherche de livres' });
  }
};

export const getBookByIsbn = async (req: AuthRequest, res: Response) => {
  try {
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json({ error: 'L\'ISBN est requis' });
    }

    // Recherche par ISBN dans Google Books API
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: `isbn:${isbn}`,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
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

    res.json(book);
  } catch (error: any) {
    console.error('Google Books ISBN search error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erreur lors de la recherche du livre',
        details: error.response.data,
      });
    }
    res.status(500).json({ error: 'Erreur lors de la recherche du livre' });
  }
};

// Récupérer les nouveautés
export const getNewReleases = async (req: AuthRequest, res: Response) => {
  try {
    // Recherche des nouveautés en français dans Google Books API
    // Utilisation de plusieurs requêtes pour obtenir une meilleure diversité
    const categories = ['fiction', 'roman', 'littérature', 'polar', 'science-fiction', 'fantasy'];
    const allBooks: any[] = [];

    // Faire plusieurs requêtes pour avoir plus de diversité
    for (const category of categories.slice(0, 3)) {
      try {
        const response = await axios.get(GOOGLE_BOOKS_API, {
          params: {
            q: `subject:${category}+inauthor:`,
            orderBy: 'newest',
            maxResults: 15,
            printType: 'books',
            langRestrict: 'fr',
          },
        });

        if (response.data.items) {
          allBooks.push(...response.data.items);
        }
      } catch (err) {
        console.log(`Erreur pour catégorie ${category}, continue...`);
      }
    }

    // Filtrer et mapper les livres
    const books = allBooks
      .filter((item: any) => {
        const volumeInfo = item.volumeInfo;
        // Filtrer uniquement les livres en français
        return volumeInfo.language === 'fr' && 
               volumeInfo.title && 
               volumeInfo.authors && 
               volumeInfo.authors.length > 0;
      })
      .map((item: any) => {
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
      })
      // Supprimer les doublons basés sur le googleBooksId
      .filter((book: any, index: number, self: any[]) => 
        index === self.findIndex((b: any) => b.googleBooksId === book.googleBooksId)
      )
      // Limiter à 40 livres
      .slice(0, 40);

    res.json(books);
  } catch (error: any) {
    console.error('Google Books new releases error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erreur lors de la récupération des nouveautés',
        details: error.response.data,
      });
    }
    res.status(500).json({ error: 'Erreur lors de la récupération des nouveautés' });
  }
};

// Récupérer les 20 dernières publications de livres de la communauté
export const getCommunityFavorites = async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer les 20 derniers avis publiés par tous les utilisateurs
    const reviews = await prisma.bookReview.findMany({
      orderBy: {
        createdAt: 'desc', // Tri par date de création, le plus récent en premier
      },
      take: 20,
      include: {
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Enrichir avec les couvertures Google Books si nécessaire
    const enrichedBooks = await Promise.all(
      reviews.map(async (review) => {
        let coverImage = review.bookCover || '';
        
        // Si pas de couverture, chercher sur Google Books
        if (!coverImage) {
          try {
            const searchQuery = `${review.bookTitle} ${review.bookAuthor}`;
            const googleResponse = await axios.get(GOOGLE_BOOKS_API, {
              params: {
                q: searchQuery,
                maxResults: 1,
              },
            });

            if (googleResponse.data.items && googleResponse.data.items.length > 0) {
              const bookData = googleResponse.data.items[0].volumeInfo;
              coverImage = bookData.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                          bookData.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
                          '';
            }
          } catch (err) {
            console.log('Impossible de récupérer la couverture depuis Google Books:', err);
          }
        }

        // S'assurer que l'URL de la couverture est complète
        if (coverImage && !coverImage.startsWith('http')) {
          coverImage = `http://localhost:3001${coverImage}`;
        }

        return {
          title: review.bookTitle,
          author: review.bookAuthor,
          coverImage: coverImage,
          isbn: review.bookIsbn || '',
          rating: review.rating,
          starRating: review.rating / 2, // Convertir de /10 à /5
          review: review.review || '',
          status: review.status,
          publishedBy: review.author.username,
          publishedByAvatar: review.author.avatar || '',
          publishedAt: review.createdAt,
        };
      })
    );

    res.json(enrichedBooks);
  } catch (error: any) {
    console.error('Community recent books error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erreur lors de la récupération des dernières publications' });
  }
};

