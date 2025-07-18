import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddJobLevelDialogProps {
  onJobLevelAdded?: () => void;
  trigger?: React.ReactNode;
}

export function AddJobLevelDialog({ onJobLevelAdded, trigger }: AddJobLevelDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobLevelName, setJobLevelName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobLevelName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("job_level_master")
        .insert([{ job_level_name: jobLevelName.trim() }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job level added successfully!",
      });

      setJobLevelName("");
      setOpen(false);
      onJobLevelAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add job level",
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
            Add Job Level
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Job Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jobLevelName">Job Level Name</Label>
            <Input
              id="jobLevelName"
              value={jobLevelName}
              onChange={(e) => setJobLevelName(e.target.value)}
              placeholder="Enter job level name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Job Level"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}