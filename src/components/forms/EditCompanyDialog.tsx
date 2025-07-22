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
  company_name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  headquarters: z.string().optional(),
  employees: z.coerce.number().positive().optional(),
  annual_revenue: z.coerce.number().positive().optional(),
  city_id: z.coerce.number().positive().optional(),
  address_type: z.string().optional(),
  postal_address_1: z.string().optional(),
  postal_address_2: z.string().optional(),
  postal_address_3: z.string().optional(),
  std: z.string().optional(),
  phone_1: z.string().optional(),
  phone_2: z.string().optional(),
  fax: z.string().optional(),
  company_mobile_number: z.string().optional(),
  common_email_id: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  no_of_employees_total: z.coerce.number().positive().optional(),
  turn_over_inr_cr: z.coerce.number().positive().optional(),
  no_of_offices_total: z.coerce.number().positive().optional(),
  no_of_branch_offices: z.coerce.number().positive().optional(),
})

interface Company {
  company_id: number
  company_name: string | null
  industry: string | null
  employees: number | null
  headquarters: string | null
  annual_revenue: number | null
  city_id: number | null
  address_type: string | null
  postal_address_1: string | null
  postal_address_2: string | null
  postal_address_3: string | null
  std: string | null
  phone_1: string | null
  phone_2: string | null
  fax: string | null
  company_mobile_number: string | null
  common_email_id: string | null
  website: string | null
  no_of_employees_total: number | null
  turn_over_inr_cr: number | null
  no_of_offices_total: number | null
  no_of_branch_offices: number | null
}

interface EditCompanyDialogProps {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyUpdated: () => void
}

export function EditCompanyDialog({ 
  company, 
  open, 
  onOpenChange, 
  onCompanyUpdated 
}: EditCompanyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<Array<{ industry_id: number; industry_vertical: string | null; sub_vertical: string | null }>>([])
  const [cities, setCities] = useState<Array<{ city_id: number; city: string | null }>>([])

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: company.company_name || "",
      industry: company.industry || "",
      headquarters: company.headquarters || "",
      employees: company.employees || undefined,
      annual_revenue: company.annual_revenue || undefined,
      city_id: company.city_id || undefined,
      address_type: company.address_type || "",
      postal_address_1: company.postal_address_1 || "",
      postal_address_2: company.postal_address_2 || "",
      postal_address_3: company.postal_address_3 || "",
      std: company.std || "",
      phone_1: company.phone_1 || "",
      phone_2: company.phone_2 || "",
      fax: company.fax || "",
      company_mobile_number: company.company_mobile_number || "",
      common_email_id: company.common_email_id || "",
      website: company.website || "",
      no_of_employees_total: company.no_of_employees_total || undefined,
      turn_over_inr_cr: company.turn_over_inr_cr || undefined,
      no_of_offices_total: company.no_of_offices_total || undefined,
      no_of_branch_offices: company.no_of_branch_offices || undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('organisation_master')
        .update(values)
        .eq('company_id', company.company_id)

      if (error) throw error

      toast.success("Company updated successfully!")
      onCompanyUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error("Failed to update company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the company information below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
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

              <FormField
                control={form.control}
                name="headquarters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headquarters</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter headquarters location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of employees" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Enter annual revenue" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="common_email_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter company email" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter website URL" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter primary phone number" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no_of_employees_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Employees</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter total employees" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="turn_over_inr_cr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turnover (INR Cr)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Enter turnover in INR crores" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}