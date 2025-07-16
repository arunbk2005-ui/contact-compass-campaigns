import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AddIndustryDialog } from "@/components/forms/AddIndustryDialog";
import { useToast } from "@/hooks/use-toast";

interface Industry {
  industry_id: number;
  industry_vertical: string | null;
  sub_vertical: string | null;
}

export default function Industries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_master')
        .select('*')
        .order('industry_id', { ascending: true });

      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast({
        title: "Error",
        description: "Failed to load industries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleIndustryAdded = () => {
    fetchIndustries();
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading industries...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Industry Master</h1>
          <p className="text-muted-foreground">Manage industry verticals and sub-verticals</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Industry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Industries ({industries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Industry Vertical</TableHead>
                  <TableHead>Sub Vertical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {industries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No industries found. Add your first industry to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  industries.map((industry) => (
                    <TableRow key={industry.industry_id}>
                      <TableCell className="font-medium">{industry.industry_id}</TableCell>
                      <TableCell>{industry.industry_vertical || "-"}</TableCell>
                      <TableCell>{industry.sub_vertical || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddIndustryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onIndustryAdded={handleIndustryAdded}
      />
    </div>
  );
}