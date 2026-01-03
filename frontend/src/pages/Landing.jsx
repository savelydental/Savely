import React from "react";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
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
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#111827",
          }}
        >
          Savely
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Encuentra tu clínica dental ideal al mejor precio.
        </p>

        {/* FORM */}
        <form
          action="https://formspree.io/f/mkogvpoq"
          method="POST"
        >
          {/* EMAIL */}
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
              outline: "none",
            }}
          />

          {/* BUTTON */}
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
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Unirme a la lista de espera
          </button>
        </form>
      </div>
    </div>
  );
}
