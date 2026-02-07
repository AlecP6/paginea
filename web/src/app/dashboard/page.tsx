'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AdSense from '@/components/AdSense';
import { postApi, commentApi } from '@/lib/api';
import { Heart, MessageSquare, Send, Trash2, X, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import ReportModal from '@/components/ReportModal';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; contentType: 'post' | 'comment' | 'bookReview'; contentId: string } | null>(null);

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
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Ne pas spécifier de type pour voir tous les posts (publics + amis)
      const response = await postApi.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await postApi.createPost({ content: newPost, type: 'PUBLIC' });
      setNewPost('');
      // Ajouter le nouveau post en haut de la liste immédiatement
      const newPostData = {
        ...response.data,
        isLiked: false,
        _count: { comments: 0, likes: 0 },
      };
      setPosts([newPostData, ...posts]);
      toast.success('Post publié !');
      // Rafraîchir pour avoir les données complètes
      setTimeout(() => fetchPosts(), 500);
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la publication');
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await postApi.unlikePost(postId);
      } else {
        await postApi.likePost(postId);
      }
      fetchPosts();
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      return;
    }

    try {
      await postApi.deletePost(postId);
      // Supprimer immédiatement de la liste sans recharger
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post supprimé !');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      // En cas d'erreur, rafraîchir la liste
      fetchPosts();
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      // Charger les détails du post avec les commentaires
      try {
        const response = await postApi.getPostById(postId);
        setPosts(posts.map(p => p.id === postId ? response.data : p));
      } catch (error) {
        toast.error('Erreur lors du chargement des commentaires');
      }
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      await commentApi.createComment({ content, postId });
      setNewComment({ ...newComment, [postId]: '' });
      // Recharger les commentaires
      const response = await postApi.getPostById(postId);
      setPosts(posts.map(p => p.id === postId ? response.data : p));
      toast.success('Commentaire ajouté !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await commentApi.deleteComment(commentId);
      // Recharger les commentaires
      const response = await postApi.getPostById(postId);
      setPosts(posts.map(p => p.id === postId ? response.data : p));
      toast.success('Commentaire supprimé !');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-xl text-white/70 animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post avec style moderne */}
        <div className="card mb-6 animate-fadeInScale">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Quoi de neuf sur vos lectures ? 📚"
              className="input-field min-h-[120px] resize-none focus:min-h-[150px] transition-all duration-300"
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-white/50">
                {newPost.length}/5000 caractères
              </span>
              <button 
                type="submit" 
                disabled={!newPost.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Publier</span>
              </button>
            </div>
          </form>
        </div>

        {/* AdSense - Après le formulaire */}
        <div className="mb-6 flex justify-center">
          <AdSense
            format="auto"
            responsive={true}
            style={{ display: 'block', minHeight: '100px' }}
          />
        </div>

        {/* Posts Feed avec animations */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              className="card animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-start space-x-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:3001${post.author.avatar}`}
                    alt={post.author.username}
                    className="avatar w-12 h-12"
                  />
                ) : (
                  <div className="avatar w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold dark:text-white hover:text-primary-400 transition-colors cursor-pointer">
                        {post.author.username}
                      </span>
                      <span className="text-white/50 text-sm">·</span>
                      <span className="text-white/50 text-sm">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user && post.author.id !== user.id && (
                        <button
                          onClick={() => setReportModal({ isOpen: true, contentType: 'post', contentId: post.id })}
                          className="p-2 text-white/50 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                          title="Signaler ce post"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                      {user && post.author.id === user.id && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Supprimer ce post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-white/90 dark:text-white leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center space-x-6 mt-4">
                    <button
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                        post.isLiked
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-white/70 hover:text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform group-hover:scale-125 ${
                          post.isLiked ? 'animate-bounceIn' : ''
                        }`}
                        fill={post.isLiked ? 'currentColor' : 'none'}
                      />
                      <span className="font-semibold">{post._count.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`group flex items-center space-x-2 transition-all duration-300 px-3 py-2 rounded-lg ${
                        expandedPostId === post.id
                          ? 'text-primary-500 bg-primary-500/10'
                          : 'text-white/70 hover:text-primary-500 hover:bg-primary-500/10'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span className="font-semibold">{post._count.comments}</span>
                    </button>
                  </div>

                  {/* Section Commentaires */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Liste des commentaires */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="flex space-x-3">
                              {comment.author.avatar ? (
                                <img
                                  src={comment.author.avatar.startsWith('http') ? comment.author.avatar : `http://localhost:3001${comment.author.avatar}`}
                                  alt={comment.author.username}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {comment.author.username[0].toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-sm dark:text-white">
                                      {comment.author.username}
                                    </span>
                                    <span className="text-white text-xs">
                                      {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {user && comment.author.id !== user.id && (
                                      <button
                                        onClick={() => setReportModal({ isOpen: true, contentType: 'comment', contentId: comment.id })}
                                        className="text-white hover:text-yellow-500 transition-colors"
                                        title="Signaler ce commentaire"
                                      >
                                        <Flag className="w-3 h-3" />
                                      </button>
                                    )}
                                    {user && comment.author.id === user.id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                        className="text-white hover:text-red-500 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-white dark:text-white">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulaire nouveau commentaire */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) =>
                            setNewComment({ ...newComment, [post.id]: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateComment(post.id);
                            }
                          }}
                          placeholder="Écrire un commentaire..."
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => handleCreateComment(post.id)}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="card text-center text-white">
              <p>Aucun post pour le moment. Soyez le premier à publier !</p>
            </div>
          )}
        </div>
      </main>

      {reportModal && (
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal(null)}
          contentType={reportModal.contentType}
          contentId={reportModal.contentId}
        />
      )}

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

