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
      {/* Fond nuancier de verts avec animations */}
      <div className="absolute inset-0 z-0">
        {/* Nuancier de verts - du clair au foncé */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800">
          {/* Couche supplémentaire pour plus de profondeur */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-700 via-transparent to-emerald-500 opacity-40"></div>
          {/* Pattern lumineux subtil animé */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300 via-emerald-500 to-transparent animate-pulse-slow"></div>
          </div>
          {/* Effet de lueur pour meilleure lisibilité du texte */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Overlay léger pour contraste du texte blanc */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Particules décoratives */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-white/25 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 container mx-auto px-4 py-20 min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo avec animation bounce */}
          <div className="flex justify-center mb-8 animate-bounceIn">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/20 p-4 hover:scale-110 transition-transform duration-500 hover:rotate-3 glow-hover">
              <img 
                src="/logo.png" 
                alt="Paginea Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Message de bienvenue avec animations échelonnées */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl mb-4 font-[family-name:var(--font-dancing-script)] animate-fadeInScale" style={{ fontWeight: 700 }}>
              Bienvenue chez Paginea
            </h1>
            
            <p className="text-2xl md:text-4xl text-white/90 drop-shadow-lg font-[family-name:var(--font-dancing-script)] animate-fadeIn" style={{ fontWeight: 600, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              Votre refuge littéraire chaleureux
            </p>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow animate-fadeIn" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              Installez-vous confortablement au coin du feu, partagez vos lectures préférées 
              et découvrez de nouvelles histoires avec une communauté de passionnés.
            </p>

            {/* Boutons d'action modernisés */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 animate-fadeIn" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
              <button
                onClick={() => router.push('/register')}
                className="group relative bg-gradient-to-r from-white to-gray-50 text-primary-700 font-bold text-lg px-10 py-4 rounded-2xl shadow-2xl 
                         transition-all duration-300 transform hover:scale-105 hover:shadow-green-400/50
                         active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center space-x-2">
                  <span>Rejoindre la communauté</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>

              <button
                onClick={() => router.push('/login')}
                className="group bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-lg px-10 py-4 rounded-2xl 
                         border-2 border-white/30 hover:border-white/50 shadow-xl 
                         transition-all duration-300 transform hover:scale-105
                         active:scale-95"
              >
                <span className="group-hover:tracking-wider transition-all duration-300">
                  Se connecter
                </span>
              </button>
            </div>

            {/* Citation avec animation */}
            <div className="mt-16 pt-8 border-t border-white/20 animate-fadeIn" style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
              <blockquote className="text-white/70 italic text-lg relative">
                <span className="text-4xl text-white/30 absolute -top-2 -left-4">"</span>
                Un livre est un rêve que vous tenez entre vos mains.
                <span className="text-4xl text-white/30 absolute -bottom-6 -right-4">"</span>
              </blockquote>
              <p className="text-white/50 text-sm mt-4 font-semibold">- Neil Gaiman</p>
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
