import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Star,
  Filter,
  Clock,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [clinics, setClinics] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState([]);

  // Filters
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || ""
  );
  const [selectedTreatment, setSelectedTreatment] = useState(
    searchParams.get("treatment") || ""
  );
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treatmentsRes, citiesRes] = await Promise.all([
          fetch(`${API}/treatments`),
          fetch(`${API}/cities`),
        ]);

        setTreatments(await treatmentsRes.json());
        setCities(await citiesRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCity) params.set("city", selectedCity);
        if (selectedTreatment) params.set("treatment_id", selectedTreatment);
        if (priceRange[0] > 0) params.set("min_price", priceRange[0]);
        if (priceRange[1] < 5000) params.set("max_price", priceRange[1]);
        if (minRating > 0) params.set("min_rating", minRating);

        const res = await fetch(`${API}/clinics?${params.toString()}`);
        const data = await res.json();
        setClinics(data);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [selectedCity, selectedTreatment, priceRange, minRating]);

  const toggleCompare = (clinicId) => {
    setCompareList((prev) => {
      if (prev.includes(clinicId)) {
        return prev.filter((id) => id !== clinicId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, clinicId];
    });
  };

  const goToCompare = () => {
    if (compareList.length >= 2 && selectedTreatment) {
      navigate(
        `/comparar?clinics=${compareList.join(",")}&treatment=${selectedTreatment}`
      );
    }
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedTreatment("");
    setPriceRange([0, 5000]);
    setMinRating(0);
    setSearchParams({});
  };

  const selectedTreatmentName = treatments.find(
    (t) => t.treatment_id === selectedTreatment
  )?.name;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* City Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Ciudad</label>
        <Select value={selectedCity} onValueChange={(val) => setSelectedCity(val === "all" ? "" : val)}>
          <SelectTrigger data-testid="filter-city-select">
            <SelectValue placeholder="Todas las ciudades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Treatment Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Tratamiento</label>
        <Select value={selectedTreatment} onValueChange={(val) => setSelectedTreatment(val === "all" ? "" : val)}>
          <SelectTrigger data-testid="filter-treatment-select">
            <SelectValue placeholder="Todos los tratamientos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tratamientos</SelectItem>
            {treatments.map((t) => (
              <SelectItem key={t.treatment_id} value={t.treatment_id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      {selectedTreatment && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Rango de precio: {priceRange[0]}€ - {priceRange[1]}€
          </label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={5000}
            step={100}
            className="mt-4"
            data-testid="price-range-slider"
          />
        </div>
      )}

      {/* Rating Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Valoración mínima: {minRating > 0 ? `${minRating}+` : "Todas"}
        </label>
        <div className="flex gap-2 mt-2">
          {[0, 4, 4.5, 4.8].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setMinRating(rating)}
              className="rounded-full"
              data-testid={`rating-filter-${rating}`}
            >
              {rating === 0 ? "Todas" : `${rating}+`}
              {rating > 0 && <Star className="w-3 h-3 ml-1 fill-current" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
        data-testid="clear-filters-button"
      >
        <X className="w-4 h-4 mr-2" />
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-secondary/30 py-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Buscar Clínicas Dentales
          </h1>
          <p className="text-muted-foreground">
            {clinics.length} clínicas encontradas
            {selectedCity && ` en ${selectedCity}`}
            {selectedTreatmentName && ` para ${selectedTreatmentName}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-bold mb-6 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h2>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  data-testid="mobile-filters-trigger"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {(selectedCity || selectedTreatment || minRating > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      Activos
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : clinics.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No se encontraron clínicas
                </h3>
                <p className="text-muted-foreground mb-4">
                  Prueba a cambiar los filtros de búsqueda
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {clinics.map((clinic) => (
                  <Card
                    key={clinic.clinic_id}
                    className="overflow-hidden clinic-card"
                    data-testid={`clinic-card-${clinic.clinic_id}`}
                  >
                    <div
                      className="aspect-video relative cursor-pointer"
                      onClick={() => navigate(`/clinica/${clinic.clinic_id}`)}
                    >
                      <img
                        src={clinic.image_url}
                        alt={clinic.name}
                        className="w-full h-full object-cover"
                      />
                      {clinic.treatment_price && (
                        <div className="absolute bottom-4 left-4 price-tag">
                          {clinic.treatment_price}€
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
                          onClick={() =>
                            navigate(`/clinica/${clinic.clinic_id}`)
                          }
                          data-testid={`clinic-name-${clinic.clinic_id}`}
                        >
                          {clinic.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full shrink-0">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold">
                            {clinic.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm flex items-center gap-1 mb-4">
                        <MapPin className="w-4 h-4" />
                        {clinic.address}, {clinic.city}
                      </p>

                      {clinic.treatment_duration && (
                        <div className="flex gap-4 mb-4">
                          <span className="badge-duration flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {clinic.treatment_duration} días
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-full"
                          onClick={() =>
                            navigate(`/clinica/${clinic.clinic_id}`)
                          }
                          data-testid={`view-details-${clinic.clinic_id}`}
                        >
                          Ver detalles
                        </Button>
                        {selectedTreatment && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={compareList.includes(clinic.clinic_id)}
                              onCheckedChange={() =>
                                toggleCompare(clinic.clinic_id)
                              }
                              disabled={
                                compareList.length >= 3 &&
                                !compareList.includes(clinic.clinic_id)
                              }
                              data-testid={`compare-checkbox-${clinic.clinic_id}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              Comparar
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Button */}
      {compareList.length >= 2 && selectedTreatment && (
        <div className="floating-cta" data-testid="compare-floating-button">
          <Button
            onClick={goToCompare}
            className="bg-accent hover:bg-accent/90 text-white rounded-full px-6"
          >
            Comparar {compareList.length} clínicas
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
