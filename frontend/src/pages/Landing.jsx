import React from "react";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#7a86d6", // FONDO ORIGINAL (NO CAMBIAR)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          maxWidth: "420px",
          width: "100%",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#1f2937",
            marginBottom: "12px",
          }}
        >
          Encuentra la mejor clínica dental
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Compara clínicas dentales de forma clara y transparente. Precio,
          calidad y opiniones reales en un solo lugar.
        </p>

        <form
          action="https://formspree.io/f/mkogvpoq"
          method="POST"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Tu email"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "16px",
              marginBottom: "20px",
              outline: "none",
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
              background: "#4f63c6", // COLOR BOTÓN MARCA
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
            marginTop: "14px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Sin spam. Solo te avisaremos cuando esté listo.
        </p>
      </div>
    </div>
  );
}
