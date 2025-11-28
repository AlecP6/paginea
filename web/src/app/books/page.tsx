'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AdSense from '@/components/AdSense';
import { bookReviewApi, booksApi } from '@/lib/api';
import { Star, Heart, MessageSquare, Plus, Trash2, Search, X, Edit2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'READ' | 'READING' | 'WANT_TO_READ' | 'ABANDONED'>('ALL');
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookAuthor: '',
    rating: 5,
    review: '',
    status: 'READ',
  });

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReviews();
    }
  }, [isAuthenticated, user]);

  const fetchReviews = async () => {
    try {
      // Récupérer uniquement les critiques de l'utilisateur connecté
      const response = await bookReviewApi.getReviews({ userId: user?.id });
      setReviews(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des critiques');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBooks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await booksApi.searchBooks(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast.error('Erreur lors de la recherche de livres');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = async (book: any) => {
    setSelectedBook(book);
    setFormData({
      ...formData,
      bookTitle: book.title,
      bookAuthor: book.author,
    });
    
    // Télécharger et définir la couverture si disponible
    if (book.coverImage) {
      try {
        const response = await fetch(book.coverImage);
        const blob = await response.blob();
        const file = new File([blob], `cover-${book.title}.jpg`, { type: 'image/jpeg' });
        setSelectedCoverFile(file);
        setCoverPreview(book.coverImage);
      } catch (error) {
        console.error('Erreur téléchargement couverture:', error);
      }
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedBook(null);
    setFormData({
      bookTitle: '',
      bookAuthor: '',
      rating: 5,
      review: '',
      status: 'READ',
    });
    setSelectedCoverFile(null);
    setCoverPreview(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Seuls les fichiers JPEG, PNG, GIF et WebP sont autorisés.');
      return;
    }

    setSelectedCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir la note de /5 à /10 pour le backend
      const reviewData = {
        ...formData,
        rating: formData.rating * 2, // Multiplier par 2 pour convertir de /5 à /10
      };

      if (editingReviewId) {
        // Mode édition : mettre à jour la critique existante
        await bookReviewApi.updateReview(editingReviewId, reviewData);
        
        // Upload cover image if selected
        if (selectedCoverFile) {
          const coverFormData = new FormData();
          coverFormData.append('cover', selectedCoverFile);
          await bookReviewApi.uploadBookCover(editingReviewId, coverFormData);
        }
        
        toast.success('Critique modifiée !');
      } else {
        // Mode création : créer une nouvelle critique
        const response = await bookReviewApi.createReview(reviewData);
        const createdReview = response.data;

        // Upload cover image if selected
        if (selectedCoverFile && createdReview.id) {
          const coverFormData = new FormData();
          coverFormData.append('cover', selectedCoverFile);
          await bookReviewApi.uploadBookCover(createdReview.id, coverFormData);
        }
        
        toast.success('Critique publiée !');
      }

      // Réinitialiser le formulaire
      setShowForm(false);
      setEditingReviewId(null);
      setFormData({
        bookTitle: '',
        bookAuthor: '',
        rating: 5,
        review: '',
        status: 'READ',
      });
      setSelectedCoverFile(null);
      setCoverPreview(null);
      setSelectedBook(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchReviews();
    } catch (error) {
      toast.error(editingReviewId ? 'Erreur lors de la modification' : 'Erreur lors de la publication');
    }
  };

  const handleEditReview = (review: any) => {
    // Charger les données de la critique dans le formulaire
    setFormData({
      bookTitle: review.bookTitle,
      bookAuthor: review.bookAuthor,
      rating: review.rating / 2, // Convertir de /10 à /5
      review: review.review || '',
      status: review.status,
    });
    
    // Charger la couverture si elle existe
    if (review.bookCover) {
      setCoverPreview(review.bookCover.startsWith('http') ? review.bookCover : `http://localhost:3001${review.bookCover}`);
    } else {
      setCoverPreview(null);
    }
    
    setEditingReviewId(review.id);
    setShowForm(true);
    setSelectedCoverFile(null);
    setSelectedBook(null);
    setSearchQuery('');
    setSearchResults([]);
    
    // Scroller vers le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingReviewId(null);
    setFormData({
      bookTitle: '',
      bookAuthor: '',
      rating: 5,
      review: '',
      status: 'READ',
    });
    setSelectedCoverFile(null);
    setCoverPreview(null);
    setSelectedBook(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLike = async (reviewId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await bookReviewApi.unlikeReview(reviewId);
      } else {
        await bookReviewApi.likeReview(reviewId);
      }
      fetchReviews();
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await bookReviewApi.deleteReview(reviewId);
      fetchReviews();
      toast.success('Avis supprimé !');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Filtrer les reviews selon l'onglet actif
  const filteredReviews = activeTab === 'ALL' 
    ? reviews 
    : reviews.filter(review => review.status === activeTab);

  // Compter les reviews par statut
  const counts = {
    ALL: reviews.length,
    READ: reviews.filter(r => r.status === 'READ').length,
    READING: reviews.filter(r => r.status === 'READING').length,
    WANT_TO_READ: reviews.filter(r => r.status === 'WANT_TO_READ').length,
    ABANDONED: reviews.filter(r => r.status === 'ABANDONED').length,
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Mes Livres</h1>
          <button
            onClick={() => {
              if (editingReviewId) {
                handleCancelEdit();
              }
              setShowForm(!showForm);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un livre</span>
          </button>
        </div>

        {/* Onglets de filtrage */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'ALL'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Tous <span className="ml-1.5 text-sm opacity-75">({counts.ALL})</span>
          </button>
          <button
            onClick={() => setActiveTab('READ')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'READ'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📚 Lu <span className="ml-1.5 text-sm opacity-75">({counts.READ})</span>
          </button>
          <button
            onClick={() => setActiveTab('READING')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'READING'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📖 En cours <span className="ml-1.5 text-sm opacity-75">({counts.READING})</span>
          </button>
          <button
            onClick={() => setActiveTab('WANT_TO_READ')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'WANT_TO_READ'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔖 À lire <span className="ml-1.5 text-sm opacity-75">({counts.WANT_TO_READ})</span>
          </button>
          <button
            onClick={() => setActiveTab('ABANDONED')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'ABANDONED'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ⏸️ Abandonné <span className="ml-1.5 text-sm opacity-75">({counts.ABANDONED})</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">
                {editingReviewId ? 'Modifier la critique' : 'Nouvelle critique'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-white hover:text-white dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recherche Google Books */}
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border-2 border-primary-200 dark:border-primary-700">
                <label className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
                  🔍 Rechercher dans Google Books
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearchBooks(e.target.value);
                    }}
                    placeholder="Tapez le titre ou l'auteur d'un livre..."
                    className="input-field pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                </div>
                
                {isSearching && (
                  <p className="text-sm text-white mt-2">Recherche en cours...</p>
                )}
                
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((book, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectBook(book)}
                        className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        {book.coverImage && (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">
                            {book.title}
                          </h4>
                          <p className="text-sm text-white dark:text-white truncate">
                            {book.author}
                          </p>
                          {book.publishedDate && (
                            <p className="text-xs text-white dark:text-white">
                              {book.publishedDate}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Livre sélectionné */}
              {selectedBook && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {selectedBook.coverImage && (
                        <img
                          src={selectedBook.coverImage}
                          alt={selectedBook.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ Livre sélectionné
                        </p>
                        <h4 className="font-semibold text-white mt-1">
                          {selectedBook.title}
                        </h4>
                        <p className="text-sm text-white dark:text-white">
                          {selectedBook.author}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-white hover:text-red-500 transition-colors"
                      title="Changer de livre"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Séparateur */}
              {selectedBook && (
                <div className="flex items-center space-x-4 py-2">
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm text-white dark:text-white">
                    ou modifier les informations
                  </span>
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Titre du livre *
                </label>
                <input
                  type="text"
                  value={formData.bookTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, bookTitle: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Auteur *
                </label>
                <input
                  type="text"
                  value={formData.bookAuthor}
                  onChange={(e) =>
                    setFormData({ ...formData, bookAuthor: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Couverture du livre
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="input-field"
                />
                {coverPreview && (
                  <div className="mt-3">
                    <img
                      src={coverPreview}
                      alt="Aperçu de la couverture"
                      className="h-48 w-auto object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Note *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= formData.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-white'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-lg font-semibold dark:text-white ml-2">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="WANT_TO_READ">Envie de lire</option>
                  <option value="READING">En cours</option>
                  <option value="READ">Lu</option>
                  <option value="ABANDONED">Abandonné</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white dark:text-white mb-2">
                  Votre avis
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) =>
                    setFormData({ ...formData, review: e.target.value })
                  }
                  className="input-field min-h-[120px] resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingReviewId ? 'Modifier' : 'Publier'}
                </button>
                {editingReviewId ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* AdSense - Après le formulaire */}
        <div className="mb-6 flex justify-center">
          <AdSense
            format="auto"
            responsive={true}
            style={{ display: 'block', minHeight: '100px' }}
          />
        </div>

        <div className="space-y-6">
          {filteredReviews.map((review, index) => (
            <>
              {index === Math.floor(filteredReviews.length / 2) && (
                <div key={`ad-${index}`} className="my-6 flex justify-center">
                  <AdSense
                    format="auto"
                    responsive={true}
                    style={{ display: 'block', minHeight: '100px' }}
                  />
                </div>
              )}
            <div key={review.id} className="card">
              <div className="flex gap-6">
                {/* Image à gauche */}
                <div className="flex-shrink-0 relative w-48 h-64">
                  {review.bookCover ? (
                    <Image
                      src={review.bookCover.startsWith('http') ? review.bookCover : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${review.bookCover}`}
                      alt={`Couverture de ${review.bookTitle}`}
                      fill
                      className="object-cover rounded-lg shadow-md"
                      sizes="192px"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                {/* Informations à droite */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {review.author.avatar ? (
                        <img
                          src={review.author.avatar.startsWith('http') ? review.author.avatar : `http://localhost:3001${review.author.avatar}`}
                          alt={review.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {review.author.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold dark:text-white">
                          {review.author.username}
                        </span>
                        <span className="text-white text-sm ml-2">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    {user && review.author.id === user.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-white hover:text-primary-600 transition-colors"
                          title="Modifier cet avis"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-white hover:text-red-500 transition-colors"
                          title="Supprimer cet avis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold dark:text-white mb-1">
                    {review.bookTitle}
                  </h3>
                  <p className="text-white dark:text-white mb-3">
                    par {review.bookAuthor}
                  </p>

              <div className="flex items-center space-x-2 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const starRating = review.rating / 2; // Convertir de /10 à /5
                    return (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= starRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-white'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="font-bold dark:text-white">{review.rating / 2}/5</span>
              </div>

              {review.review && (
                <p className="text-white mb-4">
                  {review.review}
                </p>
              )}

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
              </div>
            </div>
            </>
          ))}

          {filteredReviews.length === 0 && (
            <div className="card text-center text-white">
              <p>
                {activeTab === 'ALL' && 'Aucun livre pour le moment. Ajoutez-en un !'}
                {activeTab === 'READ' && 'Aucun livre lu pour le moment.'}
                {activeTab === 'READING' && 'Aucun livre en cours de lecture.'}
                {activeTab === 'WANT_TO_READ' && 'Aucun livre dans votre liste de lecture.'}
                {activeTab === 'ABANDONED' && 'Aucun livre abandonné.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-white dark:text-white">
            <p>&copy; 2025 Paginea. Tous droits réservés.</p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => router.push('/about')}
              className="text-white dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              À propos
            </button>
            <button
              onClick={() => router.push('/legal')}
              className="text-white dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

