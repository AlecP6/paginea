'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond nuancier de verts */}
      <div className="absolute inset-0 z-0">
        {/* Nuancier de verts - du clair au foncé */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800">
          {/* Couche supplémentaire pour plus de profondeur */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-700 via-transparent to-emerald-500 opacity-40"></div>
          {/* Pattern lumineux subtil */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300 via-emerald-500 to-transparent animate-pulse"></div>
          </div>
          {/* Effet de lueur pour meilleure lisibilité du texte */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Overlay léger pour contraste du texte blanc */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 container mx-auto px-4 py-20 min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 p-4">
              <img 
                src="/logo.png" 
                alt="Paginea Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Message de bienvenue */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl mb-4 font-[family-name:var(--font-dancing-script)]" style={{ fontWeight: 700 }}>
              Bienvenue chez Paginea
            </h1>
            
            <p className="text-2xl md:text-4xl text-white/90 drop-shadow-lg font-[family-name:var(--font-dancing-script)]" style={{ fontWeight: 600 }}>
              Votre refuge littéraire chaleureux
            </p>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Installez-vous confortablement au coin du feu, partagez vos lectures préférées 
              et découvrez de nouvelles histoires avec une communauté de passionnés.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
              <button
                onClick={() => router.push('/register')}
                className="group bg-white/95 hover:bg-white text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Rejoindre la communauté</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => router.push('/login')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-lg px-10 py-4 rounded-xl border-2 border-white/30 hover:border-white/50 shadow-xl transition-all duration-300 hover:scale-105"
              >
                Se connecter
              </button>
            </div>

            {/* Citation */}
            <div className="mt-16 pt-8 border-t border-white/20">
              <blockquote className="text-white/70 italic text-lg">
                "Un livre est un rêve que vous tenez entre vos mains."
              </blockquote>
              <p className="text-white/50 text-sm mt-2">- Neil Gaiman</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-white/60 text-sm">
            <p>&copy; 2025 Paginea. Tous droits réservés.</p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => router.push('/about')}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              À propos
            </button>
            <button
              onClick={() => router.push('/legal')}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}
