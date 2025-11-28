'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>500</h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Une erreur est survenue</p>
            <button onClick={reset} style={{ color: '#047857', cursor: 'pointer' }}>
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

