import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

interface AddCompanyDialogProps {
  onCompanyAdded: () => void
}

export function AddCompanyDialog({ onCompanyAdded }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<Array<{ industry_id: number; industry_vertical: string | null; sub_vertical: string | null }>>([])
  const [cities, setCities] = useState<Array<{ city_id: number; city: string | null }>>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    headquarters: "",
    employees: "",
    annual_revenue: "",
    city_id: "",
    address_type: "",
    postal_address_1: "",
    postal_address_2: "",
    postal_address_3: "",
    std: "",
    phone_1: "",
    phone_2: "",
    fax: "",
    company_mobile_number: "",
    common_email_id: "",
    website: "",
    no_of_employees_total: "",
    turn_over_inr_cr: "",
    no_of_offices_total: "",
    no_of_branch_offices: "",
  })

  useEffect(() => {
    fetchIndustries()
    fetchCities()
  }, [])

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_master')
        .select('industry_id, industry_vertical, sub_vertical')
        .order('industry_vertical')

      if (error) throw error
      setIndustries(data || [])
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('city_master')
        .select('city_id, city')
        .order('city')

      if (error) throw error
      setCities(data || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToInsert = {
        company_name: formData.company_name || null,
        industry: formData.industry || null,
        headquarters: formData.headquarters || null,
        employees: formData.employees ? parseInt(formData.employees) : null,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
        address_type: formData.address_type || null,
        postal_address_1: formData.postal_address_1 || null,
        postal_address_2: formData.postal_address_2 || null,
        postal_address_3: formData.postal_address_3 || null,
        std: formData.std || null,
        phone_1: formData.phone_1 || null,
        phone_2: formData.phone_2 || null,
        fax: formData.fax || null,
        company_mobile_number: formData.company_mobile_number || null,
        common_email_id: formData.common_email_id || null,
        website: formData.website || null,
        no_of_employees_total: formData.no_of_employees_total ? parseInt(formData.no_of_employees_total) : null,
        turn_over_inr_cr: formData.turn_over_inr_cr ? parseFloat(formData.turn_over_inr_cr) : null,
        no_of_offices_total: formData.no_of_offices_total ? parseInt(formData.no_of_offices_total) : null,
        no_of_branch_offices: formData.no_of_branch_offices ? parseInt(formData.no_of_branch_offices) : null,
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
        headquarters: "",
        employees: "",
        annual_revenue: "",
        city_id: "",
        address_type: "",
        postal_address_1: "",
        postal_address_2: "",
        postal_address_3: "",
        std: "",
        phone_1: "",
        phone_2: "",
        fax: "",
        company_mobile_number: "",
        common_email_id: "",
        website: "",
        no_of_employees_total: "",
        turn_over_inr_cr: "",
        no_of_offices_total: "",
        no_of_branch_offices: "",
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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Fill in the company information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
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
                <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.industry_id} value={industry.industry_vertical || ""}>
                        {industry.industry_vertical} {industry.sub_vertical ? `- ${industry.sub_vertical}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city_id">City</Label>
                <Select value={formData.city_id} onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.city_id} value={city.city_id.toString()}>
                        {city.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="employees">Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={formData.employees}
                  onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                  placeholder="Number of employees"
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
                  placeholder="Annual revenue"
                />
              </div>

              <div>
                <Label htmlFor="address_type">Address Type</Label>
                <Input
                  id="address_type"
                  value={formData.address_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_type: e.target.value }))}
                  placeholder="Address type"
                />
              </div>

              <div>
                <Label htmlFor="postal_address_1">Postal Address 1</Label>
                <Input
                  id="postal_address_1"
                  value={formData.postal_address_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_address_1: e.target.value }))}
                  placeholder="Postal address line 1"
                />
              </div>

              <div>
                <Label htmlFor="postal_address_2">Postal Address 2</Label>
                <Input
                  id="postal_address_2"
                  value={formData.postal_address_2}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_address_2: e.target.value }))}
                  placeholder="Postal address line 2"
                />
              </div>

              <div>
                <Label htmlFor="postal_address_3">Postal Address 3</Label>
                <Input
                  id="postal_address_3"
                  value={formData.postal_address_3}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_address_3: e.target.value }))}
                  placeholder="Postal address line 3"
                />
              </div>

              <div>
                <Label htmlFor="std">STD Code</Label>
                <Input
                  id="std"
                  value={formData.std}
                  onChange={(e) => setFormData(prev => ({ ...prev, std: e.target.value }))}
                  placeholder="STD code"
                />
              </div>

              <div>
                <Label htmlFor="phone_1">Phone 1</Label>
                <Input
                  id="phone_1"
                  value={formData.phone_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_1: e.target.value }))}
                  placeholder="Primary phone number"
                />
              </div>

              <div>
                <Label htmlFor="phone_2">Phone 2</Label>
                <Input
                  id="phone_2"
                  value={formData.phone_2}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_2: e.target.value }))}
                  placeholder="Secondary phone number"
                />
              </div>

              <div>
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => setFormData(prev => ({ ...prev, fax: e.target.value }))}
                  placeholder="Fax number"
                />
              </div>

              <div>
                <Label htmlFor="company_mobile_number">Company Mobile</Label>
                <Input
                  id="company_mobile_number"
                  value={formData.company_mobile_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_mobile_number: e.target.value }))}
                  placeholder="Company mobile number"
                />
              </div>

              <div>
                <Label htmlFor="common_email_id">Email</Label>
                <Input
                  id="common_email_id"
                  type="email"
                  value={formData.common_email_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, common_email_id: e.target.value }))}
                  placeholder="Company email"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Company website"
                />
              </div>

              <div>
                <Label htmlFor="no_of_employees_total">Total Employees</Label>
                <Input
                  id="no_of_employees_total"
                  type="number"
                  value={formData.no_of_employees_total}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_of_employees_total: e.target.value }))}
                  placeholder="Total number of employees"
                />
              </div>

              <div>
                <Label htmlFor="turn_over_inr_cr">Turnover (INR Cr)</Label>
                <Input
                  id="turn_over_inr_cr"
                  type="number"
                  step="0.01"
                  value={formData.turn_over_inr_cr}
                  onChange={(e) => setFormData(prev => ({ ...prev, turn_over_inr_cr: e.target.value }))}
                  placeholder="Turnover in INR crores"
                />
              </div>

              <div>
                <Label htmlFor="no_of_offices_total">Total Offices</Label>
                <Input
                  id="no_of_offices_total"
                  type="number"
                  value={formData.no_of_offices_total}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_of_offices_total: e.target.value }))}
                  placeholder="Total number of offices"
                />
              </div>

              <div>
                <Label htmlFor="no_of_branch_offices">Branch Offices</Label>
                <Input
                  id="no_of_branch_offices"
                  type="number"
                  value={formData.no_of_branch_offices}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_of_branch_offices: e.target.value }))}
                  placeholder="Number of branch offices"
                />
              </div>
            </div>
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