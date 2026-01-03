import { useEffect, useState } from "react";

const FORM_URL = "https://formspree.io/f/xxxxxxxx"; // 👈 TU URL REAL

export default function Landing() {
  const [isThankYou, setIsThankYou] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gracias") === "true") {
      setIsThankYou(true);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#6f7fd8", // 🔒 COLOR MARCA (NO CAMBIAR)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#f8fafc",
          borderRadius: 16,
          padding: "32px 24px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        {!isThankYou ? (
          <>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 12,
                color: "#1f2937",
              }}
            >
              Encuentra la mejor clínica dental
            </h1>

            <p
              style={{
                fontSize: 16,
                color: "#4b5563",
                marginBottom: 24,
              }}
            >
              Compara clínicas dentales de forma clara y transparente. Precio,
              calidad y opiniones reales en un solo lugar.
            </p>

<form action="https://formspree.io/f/mkogvpoq" method="POST">
  <input type="hidden" name="_redirect" value="https://savely.es/gracias.html">
  <input
    type="email"
    name="email"
    placeholder="Tu email"
    required
    style={{
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #ddd",
      fontSize: "16px",
      marginBottom: "20px",
      outline: "none"
    }}
  />

              <button
  type="submit"
  onClick={() => {
    if (window.gtag) {
      window.gtag("event", "lead_waitlist");
    }
  }}
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "#4f63c6",
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Unirme a la lista de espera
</button>
            </form>

            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 16,
              }}
            >
              Sin spam. Solo te avisaremos cuando esté listo.
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 12,
                color: "#1f2937",
              }}
            >
              ¡Gracias! 🎉
            </h1>

            <p
              style={{
                fontSize: 16,
                color: "#4b5563",
                marginBottom: 24,
              }}
            >
              Te has unido a la lista de espera de <strong>Savely</strong>.
              <br />
              Te avisaremos en cuanto esté listo.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: "#4f63c6",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Volver a la página principal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
