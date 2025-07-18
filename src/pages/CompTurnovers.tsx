import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddCompTurnoverDialog } from "@/components/forms/AddCompTurnoverDialog";
import { useToast } from "@/hooks/use-toast";

interface CompTurnover {
  id: number;
  turnover_range: string;
}

export default function CompTurnovers() {
  const [turnovers, setTurnovers] = useState<CompTurnover[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTurnovers = async () => {
    try {
      const { data, error } = await supabase
        .from("comp_turnover_master")
        .select("*")
        .order("turnover_range", { ascending: true });

      if (error) throw error;
      setTurnovers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch company turnovers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("comp_turnover_master")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company turnover deleted successfully",
      });
      
      fetchTurnovers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company turnover",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTurnovers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Company Turnover Management</h1>
        <AddCompTurnoverDialog onTurnoverAdded={fetchTurnovers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {turnovers.map((turnover) => (
          <Card key={turnover.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{turnover.turnover_range}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(turnover.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {turnovers.length === 0 && (
        <div className="text-center text-muted-foreground">
          No company turnovers found. Add your first turnover range to get started.
        </div>
      )}
    </div>
  );
}