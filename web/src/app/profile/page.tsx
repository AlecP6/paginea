'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { userApi } from '@/lib/api';
import { User, Edit2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loadUser, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userApi.updateProfile(formData);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    try {
      const response = await userApi.uploadAvatar(file);
      updateUser(response.data);
      toast.success('Photo de profil mise à jour !');
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'upload');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || !isAuthenticated || !user) {
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
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center">
              <User className="w-8 h-8 mr-3" />
              Mon Profil
            </h1>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>{editing ? 'Annuler' : 'Modifier'}</span>
            </button>
          </div>

          {!editing ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview || `http://localhost:3001${user.avatar}`}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                    title="Changer la photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs">Upload...</div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold dark:text-white">
                    {user.username}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              {user.bio && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{user.bio}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="input-field"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Parlez-nous de vous et de vos goûts littéraires..."
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Enregistrer les modifications
              </button>
            </form>
          )}
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

