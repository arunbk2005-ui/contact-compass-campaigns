import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AddCityDialog } from "@/components/forms/AddCityDialog";
import { useToast } from "@/hooks/use-toast";

interface City {
  city_id: number;
  country: string | null;
  region: string | null;
  pincode: string | null;
  state: string | null;
  city: string | null;
}

export default function Cities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('city_master')
        .select('*')
        .order('city_id', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCityAdded = () => {
    fetchCities();
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading cities...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">City Master</h1>
          <p className="text-muted-foreground">Manage cities, states, and regions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add City
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cities ({cities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Pincode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No cities found. Add your first city to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  cities.map((city) => (
                    <TableRow key={city.city_id}>
                      <TableCell className="font-medium">{city.city_id}</TableCell>
                      <TableCell>{city.city || "-"}</TableCell>
                      <TableCell>{city.state || "-"}</TableCell>
                      <TableCell>{city.region || "-"}</TableCell>
                      <TableCell>{city.country || "-"}</TableCell>
                      <TableCell>{city.pincode || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddCityDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onCityAdded={handleCityAdded}
      />
    </div>
  );
}