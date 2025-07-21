import { useState } from "react"
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
})

interface Company {
  company_id: number
  company_name: string | null
  industry: string | null
  employees: number | null
  headquarters: string | null
  annual_revenue: number | null
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: company.company_name || "",
      industry: company.industry || "",
      headquarters: company.headquarters || "",
      employees: company.employees || undefined,
      annual_revenue: company.annual_revenue || undefined,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the company information below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
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
                    <Input placeholder="Enter industry" {...field} />
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
                      placeholder="Enter annual revenue" 
                      {...field}
                      value={field.value || ""}
                    />
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
                {loading ? "Updating..." : "Update Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}