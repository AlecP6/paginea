'use client';

export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Une erreur est survenue</p>
        <button
          onClick={reset}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

