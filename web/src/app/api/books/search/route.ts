import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import axios from 'axios';

// ⚡ IMPORTANT: Forcer Node.js Runtime (axios ne fonctionne pas dans Edge Runtime)
export const runtime = 'nodejs';

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

    console.log(`🔍 [API] Recherche Google Books pour: "${query}"`);

    // Préparer les paramètres
    const params: any = {
      q: query,
      maxResults: 10,
      printType: 'books',
      langRestrict: 'fr',
    };

    // Ajouter la clé API si disponible
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) {
      params.key = apiKey;
      console.log('🔑 [API] Utilisation de la clé API Google Books');
    } else {
      console.log('⚠️  [API] Pas de clé API - utilisation sans clé');
    }

    // Appel à Google Books API avec axios
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params,
      timeout: 8000, // 8 secondes
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`📊 [API] Status: ${response.status}`);

    // Vérifier si des résultats existent
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.log('📚 [API] Aucun résultat trouvé');
      return NextResponse.json([]);
    }

    console.log(`✅ [API] ${response.data.items.length} livre(s) trouvé(s)`);

    // Formater les résultats
    const books = response.data.items.map((item: any) => {
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
          (info.imageLinks?.thumbnail || '').replace('http://', 'https://') ||
          (info.imageLinks?.smallThumbnail || '').replace('http://', 'https://') ||
          '',
        previewLink: info.previewLink || '',
        infoLink: info.infoLink || '',
      };
    });

    return NextResponse.json(books);

  } catch (error: any) {
    console.error('❌ [API] Erreur recherche Google Books:', error.message);
    
    // Gestion des erreurs spécifiques
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('⏱️  [API] Timeout de la requête');
      return NextResponse.json(
        { error: 'La recherche a pris trop de temps. Réessayez.' },
        { status: 408 }
      );
    }
    
    if (error.response) {
      console.error(`❌ [API] Google Books API erreur: ${error.response.status}`);
      console.error('❌ [API] Details:', error.response.data);
      
      if (error.response.status === 429) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Patientez quelques secondes.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erreur Google Books API',
          details: error.response.data,
        },
        { status: error.response.status }
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
