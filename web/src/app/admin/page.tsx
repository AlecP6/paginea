'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { reportApi, adminApi } from '@/lib/api';
import { Flag, Trash2, Check, X, AlertTriangle, MessageSquare, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user, isLoading: authLoading } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED'>('all');

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Attendre que l'utilisateur soit chargé
    if (authLoading) return; // Le store auth est encore en train de charger

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ADMIN') {
      toast.error('Accès non autorisé');
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchReports();
    }
  }, [isAuthenticated, user, router, authLoading]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await reportApi.getReports(status);
      setReports(response.data);
    } catch (error: any) {
      console.error('Fetch reports error:', error);
      if (error.response?.status === 403) {
        toast.error('Accès non autorisé');
        router.push('/dashboard');
      } else {
        toast.error('Erreur lors du chargement des signalements');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchReports();
    }
  }, [filter]);

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      await reportApi.updateReport(reportId, { status });
      toast.success('Statut mis à jour');
      fetchReports();
    } catch (error: any) {
      console.error('Update report error:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteContent = async (type: 'post' | 'comment' | 'bookReview', id: string, reportId: string) => {
    try {
      if (type === 'post') {
        await adminApi.deletePost(id);
      } else if (type === 'comment') {
        await adminApi.deleteComment(id);
      } else if (type === 'bookReview') {
        await adminApi.deleteBookReview(id);
      }

      await reportApi.updateReport(reportId, { status: 'RESOLVED' });
      toast.success('Contenu supprimé');
      fetchReports();
    } catch (error: any) {
      console.error('Delete content error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-5 h-5" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5" />;
      case 'bookReview':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'REVIEWED':
        return 'bg-blue-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Afficher le chargement si l'auth est en cours OU si on charge les reports
  if (authLoading || (!isAuthenticated && !authLoading) || (isAuthenticated && user?.role !== 'ADMIN' && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white">Chargement...</div>
      </div>
    );
  }

  // Si on charge les reports mais que l'auth est OK, afficher la page avec le chargement des reports
  if (loading && isAuthenticated && user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Flag className="w-10 h-10" /> Panel Administrateur
            </h1>
            <p className="text-white">Gérez les signalements de contenu</p>
          </div>
          <div className="card text-center text-white">
            <p>Chargement des signalements...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Flag className="w-10 h-10" /> Panel Administrateur
          </h1>
          <p className="text-white">Gérez les signalements de contenu</p>
        </div>

        {/* Filtres */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('REVIEWED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'REVIEWED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              En cours
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Résolu
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'REJECTED'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Rejeté
            </button>
          </div>
        </div>

        {/* Liste des signalements */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="card text-center text-white">
              <p>Aucun signalement {filter !== 'all' ? `avec le statut "${filter}"` : ''}</p>
            </div>
          ) : (
            reports.map((report) => {
              const contentType = report.postId ? 'post' : report.commentId ? 'comment' : 'bookReview';
              const content = report.post || report.comment || report.bookReview;
              const contentId = report.postId || report.commentId || report.bookReviewId;

              return (
                <div key={report.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getStatusColor(report.status)} text-white`}>
                        {getContentTypeIcon(contentType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white">
                            {report.reporter.username}
                          </span>
                          <span className="text-white text-sm">·</span>
                          <span className="text-white text-sm">
                            {new Date(report.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-white font-medium">Raison : </span>
                          <span className="text-white">{report.reason}</span>
                        </div>
                        {report.description && (
                          <div className="mb-2">
                            <span className="text-white font-medium">Description : </span>
                            <span className="text-white">{report.description}</span>
                          </div>
                        )}
                        {content && (
                          <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-white text-sm font-medium">
                                {contentType === 'post' ? 'Post' : contentType === 'comment' ? 'Commentaire' : 'Critique'}
                              </span>
                              <span className="text-white text-sm">par</span>
                              <span className="text-white text-sm font-semibold">
                                {content.author?.username || 'Utilisateur supprimé'}
                              </span>
                            </div>
                            <p className="text-white text-sm line-clamp-3">
                              {content.content || content.review || content.bookTitle}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {report.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'REVIEWED')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Marquer comme examiné</span>
                        </button>
                        <button
                          onClick={() => handleDeleteContent(contentType, contentId, report.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer le contenu</span>
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'REJECTED')}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                      </>
                    )}
                    {report.status === 'REVIEWED' && (
                      <>
                        <button
                          onClick={() => handleDeleteContent(contentType, contentId, report.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer le contenu</span>
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Marquer comme résolu</span>
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'REJECTED')}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                      </>
                    )}
                    {(report.status === 'RESOLVED' || report.status === 'REJECTED') && (
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'PENDING')}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Réouvrir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

