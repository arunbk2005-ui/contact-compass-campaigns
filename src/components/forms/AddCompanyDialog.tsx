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

interface AddCompanyDialogProps {
  onCompanyAdded: () => void
}

export function AddCompanyDialog({ onCompanyAdded }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    employees: "",
    headquarters: "",
    annual_revenue: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToInsert = {
        company_name: formData.company_name || null,
        industry: formData.industry || null,
        employees: formData.employees ? parseInt(formData.employees) : null,
        headquarters: formData.headquarters || null,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
      }

      const { error } = await supabase
        .from('organisation_master')
        .insert([dataToInsert])

      if (error) throw error

      toast({
        title: "Success",
        description: "Company added successfully",
      })

      setOpen(false)
      setFormData({
        company_name: "",
        industry: "",
        employees: "",
        headquarters: "",
        annual_revenue: "",
      })
      onCompanyAdded()
    } catch (error) {
      console.error('Error adding company:', error)
      toast({
        title: "Error",
        description: "Failed to add company",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Fill in the company information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              placeholder="Enter industry"
            />
          </div>

          <div>
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              value={formData.employees}
              onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
              placeholder="Enter number of employees"
            />
          </div>

          <div>
            <Label htmlFor="headquarters">Headquarters</Label>
            <Input
              id="headquarters"
              value={formData.headquarters}
              onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
              placeholder="Enter headquarters location"
            />
          </div>

          <div>
            <Label htmlFor="annual_revenue">Annual Revenue</Label>
            <Input
              id="annual_revenue"
              type="number"
              step="0.01"
              value={formData.annual_revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, annual_revenue: e.target.value }))}
              placeholder="Enter annual revenue"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}