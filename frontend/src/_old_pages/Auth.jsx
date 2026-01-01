import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mail, Lock, User, Chrome, ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/perfil");
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al iniciar sesión");
      }

      setUser(data);
      toast.success("¡Bienvenido de nuevo!");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al registrarse");
      }

      setUser(data);
      toast.success("¡Cuenta creada correctamente!");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/20">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>

        <Card className="shadow-xl" data-testid="auth-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-primary font-bold text-2xl">Denti</span>
              <span className="font-bold text-2xl">Compare</span>
            </div>
            <CardTitle className="text-xl">Accede a tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full mb-6 h-12"
              onClick={handleGoogleLogin}
              data-testid="google-login-button"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground">
                o
              </span>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="login-tab">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 h-12"
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 h-12"
                        required
                        data-testid="register-name-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 h-12"
                        minLength={6}
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-full"
                    disabled={loading}
                    data-testid="register-submit-button"
                  >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Al continuar, aceptas nuestros términos de servicio y política de
              privacidad.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
