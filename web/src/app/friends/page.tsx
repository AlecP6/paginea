'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { friendshipApi, userApi } from '@/lib/api';
import { Users, UserPlus, Search, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      fetchFriends();
      fetchRequests();
    }
  }, [isAuthenticated]);

  const fetchFriends = async () => {
    try {
      const response = await friendshipApi.getFriends();
      setFriends(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des amis');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await friendshipApi.getFriendRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await userApi.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendshipApi.sendRequest(userId);
      toast.success('Demande envoyée !');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi');
    }
  };

  const handleRespondToRequest = async (
    friendshipId: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      await friendshipApi.respondToRequest(friendshipId, action);
      toast.success(action === 'accept' ? 'Ami ajouté !' : 'Demande refusée');
      fetchFriends();
      fetchRequests();
    } catch (error) {
      toast.error('Erreur lors de la réponse');
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold dark:text-white mb-8">Mes Amis</h1>

        {/* Search */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Rechercher des utilisateurs
          </h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nom d'utilisateur, prénom, nom..."
              className="input-field flex-1"
            />
            <button onClick={handleSearch} className="btn-primary">
              Rechercher
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold dark:text-white">
                        {user.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Demandes d'amis ({requests.length})
            </h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {request.initiator.avatar ? (
                      <img
                        src={request.initiator.avatar.startsWith('http') ? request.initiator.avatar : `http://localhost:3001${request.initiator.avatar}`}
                        alt={request.initiator.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {request.initiator.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold dark:text-white">
                        {request.initiator.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Mes amis ({friends.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {friend.avatar ? (
                  <img
                    src={friend.avatar.startsWith('http') ? friend.avatar : `http://localhost:3001${friend.avatar}`}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {friend.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold dark:text-white">
                    {friend.username}
                  </p>
                </div>
              </div>
            ))}

            {friends.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-8">
                <p>Aucun ami pour le moment. Commencez à en ajouter !</p>
              </div>
            )}
          </div>
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

