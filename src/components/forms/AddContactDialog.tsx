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

interface AddContactDialogProps {
  onContactAdded: () => void
  companies: Array<{ company_id: number; company_name: string | null }>
}

export function AddContactDialog({ onContactAdded, companies }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<Array<{ city_id: number; city: string | null }>>([])
  const [departments, setDepartments] = useState<Array<{ id: number; department_name: string }>>([])
  const [jobLevels, setJobLevels] = useState<Array<{ id: number; job_level_name: string }>>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchCities()
    fetchDepartments()
    fetchJobLevels()
  }, [])

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

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('department_master')
        .select('id, department_name')
        .order('department_name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchJobLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('job_level_master')
        .select('id, job_level_name')
        .order('job_level_name')

      if (error) throw error
      setJobLevels(data || [])
    } catch (error) {
      console.error('Error fetching job levels:', error)
    }
  }

  const [formData, setFormData] = useState({
    salute: "",
    first_name: "",
    last_name: "",
    designation: "",
    department: "",
    job_level: "",
    specialization: "",
    company_id: "",
    city_id: "",
    official_email_id: "",
    personal_email_id: "",
    mobile_number: "",
    direct_phone_number: "",
    gender: "",
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the next available contact_id
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('contact_master')
        .select('contact_id')
        .order('contact_id', { ascending: false })
        .limit(1)

      if (maxIdError) throw maxIdError

      const nextId = maxIdData?.[0]?.contact_id ? maxIdData[0].contact_id + 1 : 1

      const dataToInsert: any = {
        ...formData,
        contact_id: nextId,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
      }

      // Remove empty strings to avoid constraint issues
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === "") {
          dataToInsert[key] = null
        }
      })

      const { error } = await supabase
        .from('contact_master')
        .insert(dataToInsert)

      if (error) throw error

      toast({
        title: "Success",
        description: "Contact added successfully",
      })

      setOpen(false)
      setFormData({
        salute: "",
        first_name: "",
        last_name: "",
        designation: "",
        department: "",
        job_level: "",
        specialization: "",
        company_id: "",
        city_id: "",
        official_email_id: "",
        personal_email_id: "",
        mobile_number: "",
        direct_phone_number: "",
        gender: "",
      })
      onContactAdded()
    } catch (error) {
      console.error('Error adding contact:', error)
      toast({
        title: "Error",
        description: "Failed to add contact",
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
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill in the contact information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salute">Salutation</Label>
              <Select value={formData.salute} onValueChange={(value) => setFormData(prev => ({ ...prev, salute: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr.">Mr.</SelectItem>
                  <SelectItem value="Ms.">Ms.</SelectItem>
                  <SelectItem value="Mrs.">Mrs.</SelectItem>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_id">Company</Label>
              <Select value={formData.company_id} onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_id} value={company.company_id.toString()}>
                      {company.company_name}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="Enter designation"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.department_name}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job_level">Job Level</Label>
              <Select value={formData.job_level} onValueChange={(value) => setFormData(prev => ({ ...prev, job_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job level..." />
                </SelectTrigger>
                <SelectContent>
                  {jobLevels.map((level) => (
                    <SelectItem key={level.id} value={level.job_level_name}>
                      {level.job_level_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="official_email_id">Official Email</Label>
              <Input
                id="official_email_id"
                type="email"
                value={formData.official_email_id}
                onChange={(e) => setFormData(prev => ({ ...prev, official_email_id: e.target.value }))}
                placeholder="Enter official email"
              />
            </div>

            <div>
              <Label htmlFor="personal_email_id">Personal Email</Label>
              <Input
                id="personal_email_id"
                type="email"
                value={formData.personal_email_id}
                onChange={(e) => setFormData(prev => ({ ...prev, personal_email_id: e.target.value }))}
                placeholder="Enter personal email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                value={formData.mobile_number}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <Label htmlFor="direct_phone_number">Direct Phone</Label>
              <Input
                id="direct_phone_number"
                value={formData.direct_phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, direct_phone_number: e.target.value }))}
                placeholder="Enter direct phone"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}