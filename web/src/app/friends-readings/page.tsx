'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookReviewApi } from '@/lib/api';
import { Star, Heart, MessageSquare, User as UserIcon, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function FriendsReadingsPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ID Partenaire Amazon - À remplacer par votre propre ID après inscription
  const AMAZON_AFFILIATE_ID = 'votreid-21';

  // Fonction pour générer un lien Amazon avec affiliation optimisé
  const getAmazonLink = (review: any) => {
    // Nettoyer le titre (enlever sous-titres après : ou -)
    const cleanTitle = review.bookTitle
      .split(':')[0]
      .split('-')[0]
      .trim()
      .replace(/[^\w\s]/g, '') // Enlever caractères spéciaux
      .replace(/\s+/g, '+');
    
    // Nettoyer l'auteur
    const cleanAuthor = review.bookAuthor
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
      fetchFriendsReviews();
    }
  }, [isAuthenticated]);

  const fetchFriendsReviews = async () => {
    try {
      setLoading(true);
      const response = await bookReviewApi.getFriendsReviews();
      setReviews(response.data);
    } catch (error) {
      console.error('Fetch friends reviews error:', error);
      toast.error('Erreur lors du chargement des lectures');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await bookReviewApi.unlikeReview(reviewId);
      } else {
        await bookReviewApi.likeReview(reviewId);
      }
      fetchFriendsReviews();
    } catch (error) {
      toast.error('Erreur lors de l\'action');
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
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white mb-2">📚 Lectures de mes Amis</h1>
          <p className="text-white dark:text-white">
            Découvrez ce que vos amis lisent et leurs avis sur leurs livres
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="card hover:shadow-xl transition-shadow">
                {/* En-tête avec auteur */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  {review.author.avatar ? (
                    <Image
                      src={review.author.avatar.startsWith('http') ? review.author.avatar : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${review.author.avatar}`}
                      alt={review.author.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.author.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold dark:text-white">
                      {review.author.username}
                    </p>
                    <p className="text-sm text-white">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Couverture du livre */}
                {review.bookCover && (
                  <div className="mb-4 relative w-full h-64">
                    <Image
                      src={review.bookCover.startsWith('http') ? review.bookCover : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${review.bookCover}`}
                      alt={`Couverture de ${review.bookTitle}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Informations du livre */}
                <h3 className="text-xl font-bold dark:text-white mb-1">
                  {review.bookTitle}
                </h3>
                <p className="text-white dark:text-white mb-3">
                  par {review.bookAuthor}
                </p>

                {/* Note */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-white'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold dark:text-white">{review.rating}/5</span>
                </div>

                {/* Badge statut */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    review.status === 'READ' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : review.status === 'READING'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : review.status === 'WANT_TO_READ'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-white dark:bg-gray-700 dark:text-white'
                  }`}>
                    {review.status === 'READ' && 'Lu'}
                    {review.status === 'READING' && 'En cours'}
                    {review.status === 'WANT_TO_READ' && 'Envie de lire'}
                    {review.status === 'ABANDONED' && 'Abandonné'}
                  </span>
                </div>

                {/* Avis */}
                {review.review && (
                  <p className="text-white dark:text-white mb-4 line-clamp-3">
                    {review.review}
                  </p>
                )}

                {/* Bouton Amazon */}
                <div className="mb-4">
                  <a
                    href={getAmazonLink(review)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Trouver sur Amazon
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(review.id, review.isLiked)}
                    className={`flex items-center space-x-2 ${
                      review.isLiked
                        ? 'text-red-500'
                        : 'text-white hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={review.isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{review._count.likes}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-white hover:text-primary-600">
                    <MessageSquare className="w-5 h-5" />
                    <span>{review._count.comments}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold dark:text-white mb-2">
              Aucune lecture d'amis pour le moment
            </h3>
            <p className="text-white mb-6">
              Ajoutez des amis et découvrez leurs lectures !
            </p>
            <button
              onClick={() => router.push('/friends')}
              className="btn-primary"
            >
              Trouver des amis
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

