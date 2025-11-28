export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Page non trouvée</p>
            <a href="/" style={{ color: '#047857' }}>Retour à l'accueil</a>
          </div>
        </div>
      </body>
    </html>
  );
}

