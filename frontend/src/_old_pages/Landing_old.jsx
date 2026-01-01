import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Shield,
  Award,
  Clock,
  ChevronRight,
  Star,
  CheckCircle,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [featuredClinics, setFeaturedClinics] = useState([]);

  useEffect(() => {
    // Seed database and fetch data
    const initData = async () => {
      try {
        // Seed database
        await fetch(`${API}/seed`, { method: "POST" });

        // Fetch treatments
        const treatmentsRes = await fetch(`${API}/treatments`);
        const treatmentsData = await treatmentsRes.json();
        setTreatments(treatmentsData);

        // Fetch cities
        const citiesRes = await fetch(`${API}/cities`);
        const citiesData = await citiesRes.json();
        setCities(citiesData);

        // Fetch featured clinics
        const clinicsRes = await fetch(`${API}/clinics`);
        const clinicsData = await clinicsRes.json();
        setFeaturedClinics(clinicsData.slice(0, 3));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    initData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (selectedTreatment) params.set("treatment", selectedTreatment);
    navigate(`/buscar?${params.toString()}`);
  };

  const treatmentIcons = {
    "implante-dental": "🦷",
    "ortodoncia-invisible": "😁",
    blanqueamiento: "✨",
    "limpieza-dental": "🪥",
    endodoncia: "💉",
    "carillas-dentales": "😃",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 hero-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="animate-slide-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Compara{" "}
                <span className="text-primary">clínicas dentales</span> y elige
                con confianza
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Encuentra el mejor tratamiento dental al mejor precio.
                Transparencia total en precios, procesos y garantías.
              </p>

              {/* Search Box */}
              <Card
                className="shadow-xl border-0 bg-card"
                data-testid="hero-search-box"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        ¿Dónde buscas?
                      </label>
                      <Select
                        value={selectedCity}
                        onValueChange={setSelectedCity}
                      >
                        <SelectTrigger
                          className="h-12"
                          data-testid="city-select"
                        >
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Selecciona ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        ¿Qué tratamiento?
                      </label>
                      <Select
                        value={selectedTreatment}
                        onValueChange={setSelectedTreatment}
                      >
                        <SelectTrigger
                          className="h-12"
                          data-testid="treatment-select"
                        >
                          <SelectValue placeholder="Selecciona tratamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatments.map((t) => (
                            <SelectItem
                              key={t.treatment_id}
                              value={t.treatment_id}
                            >
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleSearch}
                        className="w-full md:w-auto h-12 px-8 rounded-full"
                        data-testid="search-button"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>+200 clínicas verificadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Precios transparentes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-5 h-5 text-primary" />
                  <span>Valoraciones reales</span>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="hidden lg:block animate-slide-up stagger-2">
              <img
                src="https://images.unsplash.com/photo-1590905775253-a4f0f3c426ff?w=800&q=80"
                alt="Sonrisa saludable"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                data-testid="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra tu clínica ideal en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "1. Busca",
                description:
                  "Selecciona tu ciudad y el tratamiento que necesitas",
              },
              {
                icon: Award,
                title: "2. Compara",
                description:
                  "Analiza precios, garantías y opiniones de cada clínica",
              },
              {
                icon: Clock,
                title: "3. Decide",
                description:
                  "Elige la mejor opción con toda la información clara",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="text-center p-8 hover:shadow-lg transition-all duration-300"
                data-testid={`how-it-works-step-${index + 1}`}
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tratamientos populares
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los tratamientos más buscados por nuestros usuarios
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {treatments.map((treatment, index) => (
              <Card
                key={treatment.treatment_id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                onClick={() =>
                  navigate(`/buscar?treatment=${treatment.treatment_id}`)
                }
                data-testid={`treatment-card-${treatment.treatment_id}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">
                    {treatmentIcons[treatment.treatment_id] || "🦷"}
                  </div>
                  <h3 className="font-semibold text-sm">{treatment.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clinics */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Clínicas destacadas
              </h2>
              <p className="text-lg text-muted-foreground">
                Las mejor valoradas por nuestros usuarios
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/buscar")}
              className="hidden md:flex rounded-full"
              data-testid="view-all-clinics-button"
            >
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredClinics.map((clinic) => (
              <Card
                key={clinic.clinic_id}
                className="overflow-hidden clinic-card cursor-pointer"
                onClick={() => navigate(`/clinica/${clinic.clinic_id}`)}
                data-testid={`featured-clinic-${clinic.clinic_id}`}
              >
                <div className="aspect-video relative">
                  <img
                    src={clinic.image_url}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{clinic.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">
                        {clinic.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {clinic.city}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {clinic.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/buscar")}
              className="rounded-full"
              data-testid="mobile-view-all-clinics"
            >
              Ver todas las clínicas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para encontrar tu clínica ideal?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Compara tratamientos, precios y garantías de las mejores clínicas
            dentales de España
          </p>
          <Button
            size="lg"
            onClick={handleSearch}
            className="rounded-full px-8"
            data-testid="cta-search-button"
          >
            Empezar a buscar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 lg:px-24 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary">Denti</span>
            <span>Compare</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 DentiCompare. Transparencia dental.
          </p>
        </div>
      </footer>
    </div>
  );
}
