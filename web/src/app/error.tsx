'use client';

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          500
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            margin: "0 0 2rem 0",
            color: "#6b7280",
          }}
        >
          Une erreur est survenue
        </p>
        <button
          onClick={reset}
          style={{
            backgroundColor: "#047857",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
