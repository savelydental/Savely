import React from "react";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#1f2937",
          }}
        >
          Encuentra la mejor clínica dental
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            marginBottom: "24px",
            lineHeight: 1.5,
          }}
        >
          Compara clínicas dentales de forma clara y transparente. Precio,
          calidad y opiniones reales en un solo lugar.
        </p>

        <form
          action="https://formspree.io/f/mkogvpoq"
          method="POST"
        >
          {/* Email */}
          <input
            type="email"
            name="email"
            required
            placeholder="Tu email"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              marginBottom: "20px",
              outline: "none",
            }}
          />

          {/* Botón */}
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
              borderRadius: "12px",
              border: "none",
              background: "#4f63c6",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Unirme a la lista de espera
          </button>

          {/* Redirect */}
          <input
            type="hidden"
            name="_redirect"
            value="https://savely.es/gracias.html"
          />
        </form>

        <p
          style={{
            marginTop: "16px",
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
