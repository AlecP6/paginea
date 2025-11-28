export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Empêcher le pré-rendu
export async function generateStaticParams() {
  return [];
}

export default function NotFound() {
  return (
    <html lang="fr">
      <head>
        <title>404 - Page non trouvée</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#111827' }}>404</h1>
            <p style={{ fontSize: '1.25rem', margin: '0 0 2rem 0', color: '#6b7280' }}>Page non trouvée</p>
            <a href="/" style={{ color: '#047857', textDecoration: 'none', fontWeight: '500' }}>Retour à l'accueil</a>
          </div>
        </div>
      </body>
    </html>
  );
}

