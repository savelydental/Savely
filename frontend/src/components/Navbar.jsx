import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, API } from "@/App";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Sun, Moon, User, LogOut, Search } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      className="glass sticky top-0 z-50 border-b border-border/40"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            data-testid="navbar-logo"
          >
            <span className="text-primary">Denti</span>
            <span className="text-foreground">Compare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/buscar"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              data-testid="nav-search-link"
            >
              <Search className="w-4 h-4" />
              Buscar Clínicas
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    data-testid="user-menu-trigger"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.picture} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigate("/perfil")}
                    data-testid="profile-menu-item"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                    data-testid="logout-menu-item"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="rounded-full"
                data-testid="login-button"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="mobile-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t border-border/40 animate-fade-in"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-4">
              <Link
                to="/buscar"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-search-link"
              >
                <Search className="w-4 h-4" />
                Buscar Clínicas
              </Link>
              {user ? (
                <>
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-profile-link"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-destructive"
                    data-testid="mobile-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-full w-full"
                  data-testid="mobile-login-button"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
