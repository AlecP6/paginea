'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import AdSense from '@/components/AdSense';
import { postApi, commentApi } from '@/lib/api';
import { Heart, MessageSquare, Send, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

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
      const response = await postApi.getPosts({ type: 'PUBLIC' });
      setPosts(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await postApi.createPost({ content: newPost, type: 'PUBLIC' });
      setNewPost('');
      fetchPosts();
      toast.success('Post publié !');
    } catch (error) {
      toast.error('Erreur lors de la publication');
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
      fetchPosts();
      toast.success('Post supprimé !');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
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
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post */}
        <div className="card mb-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Quoi de neuf sur vos lectures ?"
              className="input-field min-h-[100px] resize-none"
            />
            <div className="flex justify-end mt-4">
              <button type="submit" className="btn-primary flex items-center space-x-2">
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

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start space-x-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:3001${post.author.avatar}`}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold dark:text-white">
                        {post.author.username}
                      </span>
                      <span className="text-white text-sm">·</span>
                      <span className="text-white text-sm">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {user && post.author.id === user.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-white hover:text-red-500 transition-colors"
                        title="Supprimer ce post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-white dark:text-white">
                    {post.content}
                  </p>

                  <div className="flex items-center space-x-6 mt-4">
                    <button
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked
                          ? 'text-red-500'
                          : 'text-white hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={post.isLiked ? 'currentColor' : 'none'}
                      />
                      <span>{post._count.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        expandedPostId === post.id
                          ? 'text-primary-600'
                          : 'text-white hover:text-primary-600'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{post._count.comments}</span>
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
                                  {user && comment.author.id === user.id && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className="text-white hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
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

