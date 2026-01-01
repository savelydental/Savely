import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Shield,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function ClinicDetail() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await fetch(`${API}/clinics/${clinicId}`);
        if (!res.ok) throw new Error("Clinic not found");
        const data = await res.json();
        setClinic(data);
      } catch (error) {
        console.error("Error fetching clinic:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Clínica no encontrada</h2>
          <p className="text-muted-foreground mb-4">
            La clínica que buscas no existe o ha sido eliminada
          </p>
          <Button onClick={() => navigate("/buscar")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a buscar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <div className="relative h-64 md:h-96">
        <img
          src={clinic.image_url}
          alt={clinic.name}
          className="w-full h-full object-cover"
          data-testid="clinic-hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-24">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-full bg-background/80 backdrop-blur"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  data-testid="clinic-name"
                >
                  {clinic.name}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {clinic.address}, {clinic.city}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-bold text-lg">{clinic.rating}</span>
                <span className="text-muted-foreground text-sm">
                  ({clinic.review_count} opiniones)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card data-testid="clinic-about-card">
              <CardHeader>
                <CardTitle>Sobre la clínica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{clinic.description}</p>
              </CardContent>
            </Card>

            {/* Treatments */}
            <Card data-testid="clinic-treatments-card">
              <CardHeader>
                <CardTitle>Tratamientos disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={clinic.treatments[0]?.treatment_id}
                  className="w-full"
                >
                  <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
                    {clinic.treatments.map((treatment) => (
                      <TabsTrigger
                        key={treatment.treatment_id}
                        value={treatment.treatment_id}
                        className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        data-testid={`treatment-tab-${treatment.treatment_id}`}
                      >
                        {treatment.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {clinic.treatments.map((treatment) => (
                    <TabsContent
                      key={treatment.treatment_id}
                      value={treatment.treatment_id}
                      className="mt-0"
                      data-testid={`treatment-content-${treatment.treatment_id}`}
                    >
                      <div className="space-y-6">
                        {/* Price and Duration */}
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-primary/10 rounded-xl p-4 flex-1 min-w-[150px]">
                            <p className="text-sm text-muted-foreground mb-1">
                              Precio
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {treatment.price}€
                            </p>
                          </div>
                          <div className="bg-secondary rounded-xl p-4 flex-1 min-w-[150px]">
                            <p className="text-sm text-muted-foreground mb-1">
                              Duración
                            </p>
                            <p className="text-2xl font-bold">
                              {treatment.duration_days}{" "}
                              <span className="text-base font-normal">
                                días
                              </span>
                            </p>
                          </div>
                          <div className="bg-secondary rounded-xl p-4 flex-1 min-w-[150px]">
                            <p className="text-sm text-muted-foreground mb-1">
                              Garantía
                            </p>
                            <p className="text-2xl font-bold">
                              {treatment.warranty_months}{" "}
                              <span className="text-base font-normal">
                                meses
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            Sobre el tratamiento
                          </h4>
                          <p className="text-muted-foreground">
                            {treatment.description}
                          </p>
                        </div>

                        {/* What's Included */}
                        <div>
                          <h4 className="font-semibold mb-3">Qué incluye</h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {treatment.includes.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Process */}
                        <div>
                          <h4 className="font-semibold mb-3">
                            Proceso paso a paso
                          </h4>
                          <div className="space-y-0">
                            {treatment.process_steps.map((step, index) => (
                              <div key={index} className="process-step">
                                <p className="text-sm">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24" data-testid="clinic-contact-card">
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <a
                      href={`tel:${clinic.phone}`}
                      className="font-medium hover:text-primary transition-colors"
                      data-testid="clinic-phone"
                    >
                      {clinic.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${clinic.email}`}
                      className="font-medium hover:text-primary transition-colors"
                      data-testid="clinic-email"
                    >
                      {clinic.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium" data-testid="clinic-address">
                      {clinic.address}
                      <br />
                      {clinic.postal_code} {clinic.city}
                    </p>
                  </div>
                </div>

                {/* Map */}
                <div className="mt-4">
                  <div
                    className="map-container h-48 bg-muted flex items-center justify-center"
                    data-testid="clinic-map"
                  >
                    <iframe
                      title="Ubicación de la clínica"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${clinic.longitude - 0.01}%2C${clinic.latitude - 0.01}%2C${clinic.longitude + 0.01}%2C${clinic.latitude + 0.01}&layer=mapnik&marker=${clinic.latitude}%2C${clinic.longitude}`}
                      style={{ border: 0 }}
                    />
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${clinic.latitude}&mlon=${clinic.longitude}#map=17/${clinic.latitude}/${clinic.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Ver mapa completo
                  </a>
                </div>

                <Button
                  className="w-full rounded-full mt-4"
                  size="lg"
                  data-testid="contact-clinic-button"
                >
                  Contactar clínica
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
