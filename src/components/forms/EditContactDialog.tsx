import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const formSchema = z.object({
  salute: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  job_level: z.string().optional(),
  specialization: z.string().optional(),
  company_id: z.coerce.number().positive().optional(),
  City_ID: z.coerce.number().positive().optional(),
  official_email_id: z.string().email().optional().or(z.literal("")),
  personal_email_id: z.string().email().optional().or(z.literal("")),
  mobile_number: z.string().optional(),
  direct_phone_number: z.string().optional(),
  gender: z.string().optional(),
  Email_Optin: z.string().optional(),
})

interface Contact {
  contact_id: number
  salute: string | null
  first_name: string | null
  last_name: string | null
  designation: string | null
  department: string | null
  job_level: string | null
  specialization: string | null
  company_id: number | null
  City_ID: number | null
  official_email_id: string | null
  personal_email_id: string | null
  mobile_number: string | null
  direct_phone_number: string | null
  gender: string | null
  Email_Optin: string | null
}

interface EditContactDialogProps {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
  onContactUpdated: () => void
  companies: Array<{ company_id: number; company_name: string | null }>
}

export function EditContactDialog({ 
  contact, 
  open, 
  onOpenChange, 
  onContactUpdated,
  companies 
}: EditContactDialogProps) {
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<Array<{ city_id: number; city: string | null }>>([])
  const [departments, setDepartments] = useState<Array<{ id: number; department_name: string }>>([])
  const [jobLevels, setJobLevels] = useState<Array<{ id: number; job_level_name: string }>>([])

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salute: contact.salute || "",
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      designation: contact.designation || "",
      department: contact.department || "",
      job_level: contact.job_level || "",
      specialization: contact.specialization || "",
      company_id: contact.company_id || undefined,
      City_ID: contact.City_ID || undefined,
      official_email_id: contact.official_email_id || "",
      personal_email_id: contact.personal_email_id || "",
      mobile_number: contact.mobile_number || "",
      direct_phone_number: contact.direct_phone_number || "",
      gender: contact.gender || "",
      Email_Optin: contact.Email_Optin || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('contact_master')
        .update(values)
        .eq('contact_id', contact.contact_id)

      if (error) throw error

      toast.success("Contact updated successfully!")
      onContactUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error("Failed to update contact")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update the contact information below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salutation</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="City_ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Level</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter specialization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="official_email_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter official email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personal_email_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter personal email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direct_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter direct phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Email_Optin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Opt-in</FormLabel>
                  <FormControl>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email preference..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}