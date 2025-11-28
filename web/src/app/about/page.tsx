'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import { BookOpen, Users, Star, MessageSquare, Heart, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="À propos"
        description="Découvrez Paginea, le réseau social de lecture qui connecte les passionnés de livres. Partagez vos avis, découvrez de nouveaux livres et connectez-vous avec d'autres lecteurs."
        keywords="Paginea, réseau social lecture, avis livres, critiques livres, communauté lecteurs, recommandations livres"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-lg p-3">
              <img 
                src="/logo.png" 
                alt="Paginea Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-[family-name:var(--font-dancing-script)]" style={{ fontWeight: 700 }}>
            Bienvenue sur Paginea
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-[family-name:var(--font-dancing-script)]" style={{ fontWeight: 600 }}>
            Le réseau social qui connecte les passionnés de lecture
          </p>
        </div>

        {/* Fonctionnalités */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Nos Fonctionnalités
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Notez vos lectures
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Attribuez une note de 1 à 10 et partagez vos avis détaillés sur les livres que vous avez lus.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Connectez-vous
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ajoutez des amis et suivez leurs lectures pour découvrir de nouvelles recommandations.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mur Post-it
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Partagez vos pensées et découvertes littéraires sur le mur public de la communauté.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Découvrez le Top
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Consultez les livres les mieux notés par la communauté et trouvez votre prochaine lecture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pourquoi Paginea */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pourquoi choisir Paginea ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Passion commune :</strong> Rejoignez une communauté qui partage votre amour de la lecture
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Découvertes :</strong> Trouvez votre prochaine lecture grâce aux avis de lecteurs passionnés
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Échanges enrichissants :</strong> Partagez vos impressions et débattez avec d'autres lecteurs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Suivi personnalisé :</strong> Gardez une trace de toutes vos lectures et notes
                </p>
              </div>
            </div>
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

