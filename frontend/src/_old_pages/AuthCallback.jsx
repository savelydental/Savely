import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "@/App";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get("session_id");

        if (!sessionId) {
          toast.error("No se encontró la sesión");
          navigate("/auth");
          return;
        }

        // Exchange session_id for user data
        const res = await fetch(`${API}/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!res.ok) {
          throw new Error("Error al procesar la sesión");
        }

        const userData = await res.json();
        setUser(userData);
        toast.success(`¡Bienvenido, ${userData.name}!`);

        // Clear the hash and redirect
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Error al iniciar sesión con Google");
        navigate("/auth");
      }
    };

    processSession();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Procesando inicio de sesión...</p>
      </div>
    </div>
  );
}
