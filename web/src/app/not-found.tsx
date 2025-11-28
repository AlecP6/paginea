export const dynamic = "force-dynamic";

export const revalidate = 0;

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
            color: "#111827",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            margin: "0 0 2rem 0",
            color: "#6b7280",
          }}
        >
          Page non trouvée
        </p>
        <a
          href="/"
          style={{
            color: "#047857",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
