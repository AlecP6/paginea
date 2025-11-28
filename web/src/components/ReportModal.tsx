'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { reportApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment' | 'bookReview';
  contentId: string;
}

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Harcèlement',
  'Spam',
  'Fausses informations',
  'Violation des droits d\'auteur',
  'Autre',
];

export default function ReportModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        reason,
        description: description.trim() || undefined,
      };

      if (contentType === 'post') {
        data.postId = contentId;
      } else if (contentType === 'comment') {
        data.commentId = contentId;
      } else if (contentType === 'bookReview') {
        data.bookReviewId = contentId;
      }

      await reportApi.createReport(data);
      toast.success('Signalement envoyé avec succès');
      onClose();
      setReason('');
      setDescription('');
    } catch (error: any) {
      console.error('Report error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="card max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Signaler ce contenu</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Raison du signalement *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Sélectionner une raison</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des détails sur le problème..."
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Signaler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

