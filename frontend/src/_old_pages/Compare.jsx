import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Clock,
  Shield,
  MapPin,
  Award,
} from "lucide-react";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  const clinicIds = searchParams.get("clinics")?.split(",") || [];
  const treatmentId = searchParams.get("treatment");

  useEffect(() => {
    const fetchComparison = async () => {
      if (clinicIds.length < 2 || !treatmentId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinic_ids: clinicIds,
            treatment_id: treatmentId,
          }),
        });

        if (!res.ok) throw new Error("Comparison failed");
        const data = await res.json();
        setComparisonData(data);
      } catch (error) {
        console.error("Error fetching comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!comparisonData || comparisonData.comparisons.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">No se puede comparar</h2>
          <p className="text-muted-foreground mb-4">
            Necesitas seleccionar al menos 2 clínicas y un tratamiento para
            comparar
          </p>
          <Button onClick={() => navigate("/buscar")} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a buscar
          </Button>
        </Card>
      </div>
    );
  }

  const { treatment_name, comparisons } = comparisonData;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-secondary/30 py-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            data-testid="comparison-title"
          >
            Comparando {treatment_name}
          </h1>
          <p className="text-muted-foreground">
            {comparisons.length} clínicas seleccionadas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-8">
        {/* Mobile Cards View */}
        <div className="lg:hidden space-y-6">
          {comparisons.map((item, index) => (
            <Card
              key={item.clinic.clinic_id}
              className={`overflow-hidden ${item.is_best_value ? "ring-2 ring-primary" : ""}`}
              data-testid={`compare-card-mobile-${item.clinic.clinic_id}`}
            >
              {item.is_best_value && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                  <Award className="w-4 h-4 inline mr-1" />
                  Mejor precio
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={item.clinic.image_url}
                    alt={item.clinic.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{item.clinic.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.clinic.city}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {item.clinic.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {item.treatment.price}€
                    </p>
                    <p className="text-xs text-muted-foreground">Precio</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold">
                      {item.treatment.duration_days}
                    </p>
                    <p className="text-xs text-muted-foreground">Días</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold">
                      {item.treatment.warranty_months}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Meses garantía
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Incluye:</h4>
                  <div className="space-y-1">
                    {item.treatment.includes.slice(0, 3).map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        <span>{inc}</span>
                      </div>
                    ))}
                    {item.treatment.includes.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{item.treatment.includes.length - 3} más
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full rounded-full"
                  onClick={() => navigate(`/clinica/${item.clinic.clinic_id}`)}
                >
                  Ver clínica
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card data-testid="comparison-table">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Característica</TableHead>
                    {comparisons.map((item) => (
                      <TableHead
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        <div className="space-y-2 py-4">
                          {item.is_best_value && (
                            <Badge className="bg-primary">
                              <Award className="w-3 h-3 mr-1" />
                              Mejor precio
                            </Badge>
                          )}
                          <img
                            src={item.clinic.image_url}
                            alt={item.clinic.name}
                            className="w-24 h-24 rounded-lg object-cover mx-auto"
                          />
                          <h3
                            className="font-bold cursor-pointer hover:text-primary"
                            onClick={() =>
                              navigate(`/clinica/${item.clinic.clinic_id}`)
                            }
                          >
                            {item.clinic.name}
                          </h3>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{item.clinic.rating}</span>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Price */}
                  <TableRow>
                    <TableCell className="font-medium">Precio</TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        <span className="text-2xl font-bold text-primary">
                          {item.treatment.price}€
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Duration */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Duración
                      </div>
                    </TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        {item.treatment.duration_days} días
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Warranty */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        Garantía
                      </div>
                    </TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        {item.treatment.warranty_months} meses
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Location */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Ubicación
                      </div>
                    </TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        {item.clinic.city}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* What's Included */}
                  <TableRow>
                    <TableCell className="font-medium align-top">
                      Qué incluye
                    </TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        <ul className="space-y-1 text-sm">
                          {item.treatment.includes.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Process Steps */}
                  <TableRow>
                    <TableCell className="font-medium align-top">
                      Proceso
                    </TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        <ol className="space-y-1 text-sm list-decimal list-inside">
                          {item.treatment.process_steps.map((step, i) => (
                            <li key={i} className="text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Actions */}
                  <TableRow>
                    <TableCell></TableCell>
                    {comparisons.map((item) => (
                      <TableCell
                        key={item.clinic.clinic_id}
                        className={`text-center ${item.is_best_value ? "best-value-column" : ""}`}
                      >
                        <Button
                          className="rounded-full"
                          onClick={() =>
                            navigate(`/clinica/${item.clinic.clinic_id}`)
                          }
                          data-testid={`view-clinic-${item.clinic.clinic_id}`}
                        >
                          Ver clínica
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
