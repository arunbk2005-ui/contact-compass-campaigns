import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddEmpRangeDialog } from "@/components/forms/AddEmpRangeDialog";
import { useToast } from "@/hooks/use-toast";

interface EmpRange {
  id: number;
  employee_range: string;
}

export default function EmpRanges() {
  const [empRanges, setEmpRanges] = useState<EmpRange[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmpRanges = async () => {
    try {
      const { data, error } = await supabase
        .from("emp_range_master")
        .select("*")
        .order("employee_range", { ascending: true });

      if (error) throw error;
      setEmpRanges(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch employee ranges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("emp_range_master")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee range deleted successfully",
      });
      
      fetchEmpRanges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee range",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmpRanges();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Range Management</h1>
        <AddEmpRangeDialog onEmpRangeAdded={fetchEmpRanges} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {empRanges.map((empRange) => (
          <Card key={empRange.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{empRange.employee_range}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(empRange.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {empRanges.length === 0 && (
        <div className="text-center text-muted-foreground">
          No employee ranges found. Add your first employee range to get started.
        </div>
      )}
    </div>
  );
}