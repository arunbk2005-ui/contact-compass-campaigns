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

interface AddCityDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCityAdded: () => void;
}

export function AddCityDialog({ open: externalOpen, onOpenChange: externalOnOpenChange, onCityAdded }: AddCityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    city: "",
    state: "",
    country: "",
    region: "",
    pincode: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the next available city_id
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('city_master')
        .select('city_id')
        .order('city_id', { ascending: false })
        .limit(1)

      if (maxIdError) throw maxIdError

      const nextId = maxIdData?.[0]?.city_id ? maxIdData[0].city_id + 1 : 1

      const dataToInsert = {
        city_id: nextId,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        region: formData.region || null,
        pincode: formData.pincode || null,
      }

      const { error } = await supabase
        .from('city_master')
        .insert(dataToInsert)

      if (error) throw error

      toast({
        title: "Success",
        description: "City added successfully",
      })

      setOpen(false)
      setFormData({
        city: "",
        state: "",
        country: "",
        region: "",
        pincode: "",
      })
      onCityAdded()
    } catch (error) {
      console.error('Error adding city:', error)
      toast({
        title: "Error",
        description: "Failed to add city",
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
          Add City
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
          <DialogDescription>
            Add a new city to the master list
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city name"
              required
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              placeholder="Enter state"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Enter country"
            />
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              placeholder="Enter region"
            />
          </div>

          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
              placeholder="Enter pincode"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add City"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}