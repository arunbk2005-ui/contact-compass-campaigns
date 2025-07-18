import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddDepartmentDialogProps {
  onDepartmentAdded?: () => void;
  trigger?: React.ReactNode;
}

export function AddDepartmentDialog({ onDepartmentAdded, trigger }: AddDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("department_master")
        .insert([{ department_name: departmentName.trim() }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department added successfully!",
      });

      setDepartmentName("");
      setOpen(false);
      onDepartmentAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add department",
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
            Add Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="departmentName">Department Name</Label>
            <Input
              id="departmentName"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Enter department name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}