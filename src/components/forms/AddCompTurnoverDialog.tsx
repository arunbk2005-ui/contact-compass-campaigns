import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddCompTurnoverDialogProps {
  onTurnoverAdded?: () => void;
  trigger?: React.ReactNode;
}

export function AddCompTurnoverDialog({ onTurnoverAdded, trigger }: AddCompTurnoverDialogProps) {
  const [open, setOpen] = useState(false);
  const [turnoverRange, setTurnoverRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnoverRange.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("comp_turnover_master")
        .insert([{ turnover_range: turnoverRange.trim() }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company turnover range added successfully!",
      });

      setTurnoverRange("");
      setOpen(false);
      onTurnoverAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add turnover range",
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
            Add Turnover Range
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Company Turnover Range</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="turnoverRange">Turnover Range</Label>
            <Input
              id="turnoverRange"
              value={turnoverRange}
              onChange={(e) => setTurnoverRange(e.target.value)}
              placeholder="e.g., 1-10 Crores"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Turnover Range"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}