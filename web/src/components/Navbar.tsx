'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { BookOpen, PenLine, Users, BookMarked, LogOut, User, ChevronDown, Store, Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    // Quand connecté, aller vers la page À propos
    // Quand déconnecté, aller vers l'accueil
    router.push('/about');
  };

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Menu burger mobile/tablette (visible uniquement sur petits écrans) */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-primary-400 transition-colors p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Logo et nom du site - centré sur mobile/tablette, à gauche sur desktop */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3">
            <button
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity flex items-center gap-3"
            >
              <span className="text-2xl lg:text-4xl font-bold text-white font-[family-name:var(--font-dancing-script)]" style={{ fontWeight: 700 }}>
                Paginea
              </span>
              <img 
                src="/logo.png" 
                alt="Paginea" 
                className="h-16 lg:h-20 w-auto object-contain"
              />
            </button>
          </div>

          {/* Navigation centrée - cachée sur mobile/tablette */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <PenLine className="w-5 h-5" />
                <span>Post-it</span>
              </button>

              <button
                onClick={() => router.push('/books')}
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <BookMarked className="w-5 h-5" />
                <span>Mes Livres</span>
              </button>

              <button
                onClick={() => router.push('/bookstore')}
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <Store className="w-5 h-5" />
                <span>Librairie</span>
              </button>

              <button
                onClick={() => router.push('/friends-readings')}
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>Lectures Amis</span>
              </button>

              <button
                onClick={() => router.push('/friends')}
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Amis</span>
              </button>
            </div>
          </div>

          {/* Menu utilisateur à droite */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user?.username}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu utilisateur déroulant */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Profil</span>
                </button>
                
                <div className="border-t border-gray-700 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-700 py-4"
          >
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  router.push('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <PenLine className="w-5 h-5" />
                <span>Post-it</span>
              </button>

              <button
                onClick={() => {
                  router.push('/books');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <BookMarked className="w-5 h-5" />
                <span>Mes Livres</span>
              </button>

              <button
                onClick={() => {
                  router.push('/bookstore');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <Store className="w-5 h-5" />
                <span>Librairie</span>
              </button>

              <button
                onClick={() => {
                  router.push('/friends-readings');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <BookOpen className="w-5 h-5" />
                <span>Lectures Amis</span>
              </button>

              <button
                onClick={() => {
                  router.push('/friends');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <Users className="w-5 h-5" />
                <span>Amis</span>
              </button>

              <div className="border-t border-gray-700 my-2"></div>

              <button
                onClick={() => {
                  router.push('/profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

