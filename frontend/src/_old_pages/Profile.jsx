import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mail, User, Calendar, LogOut, ArrowLeft } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      toast.success("Sesión cerrada correctamente");
      navigate("/");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>

        <Card className="shadow-xl" data-testid="profile-card">
          <CardHeader className="text-center pb-0">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl" data-testid="profile-name">
              {user.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="profile-email">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID de usuario</p>
                  <p className="font-medium font-mono text-sm">
                    {user.user_id}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold">Acciones</h3>

              <Button
                variant="destructive"
                className="w-full rounded-full"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Future features placeholder */}
        <Card className="mt-6 p-6 text-center border-dashed">
          <p className="text-muted-foreground">
            Próximamente: Historial de búsquedas, clínicas favoritas y más
          </p>
        </Card>
      </div>
    </div>
  );
}
