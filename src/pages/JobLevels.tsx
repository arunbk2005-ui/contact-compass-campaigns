import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddJobLevelDialog } from "@/components/forms/AddJobLevelDialog";
import { useToast } from "@/hooks/use-toast";

interface JobLevel {
  id: number;
  job_level_name: string;
}

export default function JobLevels() {
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobLevels = async () => {
    try {
      const { data, error } = await supabase
        .from("job_level_master")
        .select("*")
        .order("job_level_name", { ascending: true });

      if (error) throw error;
      setJobLevels(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch job levels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("job_level_master")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job level deleted successfully",
      });
      
      fetchJobLevels();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job level",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchJobLevels();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Level Management</h1>
        <AddJobLevelDialog onJobLevelAdded={fetchJobLevels} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobLevels.map((jobLevel) => (
          <Card key={jobLevel.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{jobLevel.job_level_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(jobLevel.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobLevels.length === 0 && (
        <div className="text-center text-muted-foreground">
          No job levels found. Add your first job level to get started.
        </div>
      )}
    </div>
  );
}