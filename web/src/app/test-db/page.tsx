'use client';

import { useEffect, useState } from 'react';

export default function TestDBPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        setStatus({ error: err.message });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Diagnostic du Système</h1>
        
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">État du Système</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status Global:</span>
                <span className={`font-bold ${status?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {status?.status || 'unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Base de données:</span>
                <span className={`font-bold ${
                  status?.checks?.database === 'connected' ? 'text-green-600' : 
                  status?.checks?.database === 'error' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {status?.checks?.database || 'unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>JWT_SECRET:</span>
                <span className={`font-bold ${
                  status?.checks?.jwtSecret === 'ok' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status?.checks?.jwtSecret || 'unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Variables d'environnement:</span>
                <span className={`font-bold ${
                  status?.checks?.env === 'ok' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status?.checks?.env || 'unknown'}
                </span>
              </div>
            </div>
          </div>

          {status?.errors && status.errors.length > 0 && (
            <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Erreurs</h2>
              <ul className="list-disc list-inside space-y-1">
                {status.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Réponse Complète</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

