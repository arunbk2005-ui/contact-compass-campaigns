import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddEmpRangeDialogProps {
  onEmpRangeAdded?: () => void;
  trigger?: React.ReactNode;
}

export function AddEmpRangeDialog({ onEmpRangeAdded, trigger }: AddEmpRangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [employeeRange, setEmployeeRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeRange.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("emp_range_master")
        .insert([{ employee_range: employeeRange.trim() }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee range added successfully!",
      });

      setEmployeeRange("");
      setOpen(false);
      onEmpRangeAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee range",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee Range
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee Range</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employeeRange">Employee Range</Label>
            <Input
              id="employeeRange"
              value={employeeRange}
              onChange={(e) => setEmployeeRange(e.target.value)}
              placeholder="e.g., 1-50 employees"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee Range"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}