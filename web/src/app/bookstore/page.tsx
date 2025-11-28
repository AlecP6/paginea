'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import AdSense from '@/components/AdSense';
import { booksApi } from '@/lib/api';
import { BookOpen, ExternalLink, ShoppingCart, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Book {
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  rating: number;
  starRating: number;
  review: string;
  status: string;
  publishedBy: string;
  publishedByAvatar: string;
  publishedAt: string;
}

export default function BookstorePage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // ID Partenaire Amazon - À remplacer par votre propre ID après inscription
  const AMAZON_AFFILIATE_ID = 'votreid-21';

  // Fonction pour générer un lien Amazon avec affiliation optimisé
  const getAmazonLink = (book: Book) => {
    // Nettoyer le titre (enlever sous-titres après : ou -)
    const cleanTitle = book.title
      .split(':')[0]
      .split('-')[0]
      .trim()
      .replace(/[^\w\s]/g, '') // Enlever caractères spéciaux
      .replace(/\s+/g, '+');
    
    // Nettoyer l'auteur
    const cleanAuthor = book.author
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '+');
    
    // Recherche optimisée par titre + auteur + "livre" pour de meilleurs résultats
    const searchQuery = `${cleanTitle}+${cleanAuthor}+livre`;
    
    // Toujours utiliser la recherche (plus fiable que l'ISBN direct)
    // avec filtre sur la catégorie Livres
    return `https://www.amazon.fr/s?k=${searchQuery}&i=stripbooks&tag=${AMAZON_AFFILIATE_ID}`;
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCommunityFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchCommunityFavorites = async () => {
    try {
      console.log('Fetching recent books...');
      const response = await booksApi.getRecentReviews();
      console.log('Response:', response.data);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching recent books:', error);
      toast.error('Erreur lors du chargement des dernières publications');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Librairie"
        description="Découvrez les dernières publications de livres partagées par la communauté Paginea. Trouvez votre prochaine lecture parmi les livres recommandés par les lecteurs."
        keywords="librairie, nouveautés livres, dernières publications, livres recommandés, avis lecteurs, Paginea"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-primary-600" />
            Librairie - Dernières Publications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Découvrez les 20 derniers livres ajoutés par la communauté Paginea
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 italic">
            ℹ️ En tant que Partenaire Amazon, Paginea réalise un bénéfice sur les achats remplissant les conditions requises.
          </p>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="card text-center text-gray-500">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>Aucune publication pour le moment. Soyez les premiers à ajouter des livres !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book, index) => (
              <div
                key={`${book.title}-${book.publishedBy}-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
              >
                {/* Book Cover */}
                <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage.startsWith('http') ? book.coverImage : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${book.coverImage}`}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      loading="lazy"
                      onError={(e) => {
                        // Si l'image ne charge pas, afficher l'icône par défaut
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[3rem]">
                    {book.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {book.author}
                  </p>

                  {/* Note et infos */}
                  <div className="mb-3 space-y-2">
                    {/* Étoiles */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(book.starRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : i < book.starRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {book.starRating.toFixed(1)}
                      </span>
                    </div>
                    
                    {/* Publié par */}
                    <div className="flex items-center gap-2">
                      {book.publishedByAvatar ? (
                        <img
                          src={book.publishedByAvatar.startsWith('http') ? book.publishedByAvatar : `http://localhost:3001${book.publishedByAvatar}`}
                          alt={book.publishedBy}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {book.publishedBy[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        par {book.publishedBy}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(book.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Bouton Trouver sur Amazon */}
                  <a
                    href={getAmazonLink(book)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Trouver sur Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AdSense - En bas de la page */}
        <div className="mt-8 mb-6 flex justify-center">
          <AdSense
            format="auto"
            responsive={true}
            style={{ display: 'block', minHeight: '100px' }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Paginea. Tous droits réservés.</p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => router.push('/about')}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              À propos
            </button>
            <button
              onClick={() => router.push('/legal')}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

