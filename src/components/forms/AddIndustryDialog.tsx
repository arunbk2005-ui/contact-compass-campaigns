import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface AddIndustryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onIndustryAdded: () => void;
}

export function AddIndustryDialog({ open: externalOpen, onOpenChange: externalOnOpenChange, onIndustryAdded }: AddIndustryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    industry_vertical: "",
    sub_vertical: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the next available industry_id
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('industry_master')
        .select('industry_id')
        .order('industry_id', { ascending: false })
        .limit(1)

      if (maxIdError) throw maxIdError

      const nextId = maxIdData?.[0]?.industry_id ? maxIdData[0].industry_id + 1 : 1

      const dataToInsert = {
        industry_id: nextId,
        industry_vertical: formData.industry_vertical || null,
        sub_vertical: formData.sub_vertical || null,
      }

      const { error } = await supabase
        .from('industry_master')
        .insert(dataToInsert)

      if (error) throw error

      toast({
        title: "Success",
        description: "Industry added successfully",
      })

      setOpen(false)
      setFormData({
        industry_vertical: "",
        sub_vertical: "",
      })
      onIndustryAdded()
    } catch (error) {
      console.error('Error adding industry:', error)
      toast({
        title: "Error",
        description: "Failed to add industry",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Industry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Industry</DialogTitle>
          <DialogDescription>
            Add a new industry to the master list
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="industry_vertical">Industry Vertical *</Label>
            <Input
              id="industry_vertical"
              value={formData.industry_vertical}
              onChange={(e) => setFormData(prev => ({ ...prev, industry_vertical: e.target.value }))}
              placeholder="Enter industry vertical"
              required
            />
          </div>

          <div>
            <Label htmlFor="sub_vertical">Sub Vertical</Label>
            <Input
              id="sub_vertical"
              value={formData.sub_vertical}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_vertical: e.target.value }))}
              placeholder="Enter sub vertical"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Industry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}