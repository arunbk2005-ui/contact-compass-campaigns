import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddDepartmentDialog } from "@/components/forms/AddDepartmentDialog";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: number;
  department_name: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("department_master")
        .select("*")
        .order("department_name", { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("department_master")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Management</h1>
        <AddDepartmentDialog onDepartmentAdded={fetchDepartments} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{department.department_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(department.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center text-muted-foreground">
          No departments found. Add your first department to get started.
        </div>
      )}
    </div>
  );
}