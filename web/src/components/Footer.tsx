'use client';

import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-gray-700">
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
  );
}

