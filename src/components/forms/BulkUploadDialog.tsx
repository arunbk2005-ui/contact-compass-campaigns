import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'
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
import { Upload, Download } from "lucide-react"

interface BulkUploadDialogProps {
  onUploadComplete: () => void
}

export function BulkUploadDialog({ onUploadComplete }: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadType, setUploadType] = useState<"contacts" | "companies" | "">("")
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const downloadTemplate = (type: "contacts" | "companies") => {
    let headers: string[] = []
    let sampleData: any[] = []

    if (type === "contacts") {
      headers = [
        "salute", "first_name", "last_name", "designation", "department", 
        "job_level", "specialization", "company_id", "official_email_id", 
        "personal_email_id", "mobile_number", "direct_phone_number", "gender"
      ]
      sampleData = [
        {
          salute: "Mr.",
          first_name: "John",
          last_name: "Doe",
          designation: "Software Engineer",
          department: "Engineering",
          job_level: "Senior",
          specialization: "Frontend Development",
          company_id: 1,
          official_email_id: "john.doe@company.com",
          personal_email_id: "john@email.com",
          mobile_number: "+1234567890",
          direct_phone_number: "+1234567891",
          gender: "Male"
        }
      ]
    } else {
      headers = [
        "company_name", "industry", "headquarters", "employees", "annual_revenue",
        "address_type", "postal_address_1", "postal_address_2", "postal_address_3",
        "std", "phone_1", "phone_2", "fax", "company_mobile_number", 
        "common_email_id", "website", "no_of_employees_total", "turn_over_inr_cr",
        "no_of_offices_total", "no_of_branch_offices"
      ]
      sampleData = [
        {
          company_name: "Tech Corp Inc.",
          industry: "Technology",
          headquarters: "San Francisco, CA",
          employees: 500,
          annual_revenue: 50000000,
          address_type: "Corporate",
          postal_address_1: "123 Tech Street",
          postal_address_2: "Suite 100",
          postal_address_3: "Building A",
          std: "022",
          phone_1: "+1-555-0123",
          phone_2: "+1-555-0124",
          fax: "+1-555-0125",
          company_mobile_number: "+1-555-0126",
          common_email_id: "info@techcorp.com",
          website: "https://techcorp.com",
          no_of_employees_total: 500,
          turn_over_inr_cr: 100.5,
          no_of_offices_total: 5,
          no_of_branch_offices: 4
        }
      ]
    }

    const ws = XLSX.utils.json_to_sheet(sampleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, type)
    XLSX.writeFile(wb, `${type}_template.xlsx`)
  }

  const handleFileUpload = async () => {
    if (!file || !uploadType) {
      toast({
        title: "Error",
        description: "Please select a file and upload type",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error("No data found in the Excel file")
      }

      let tableName: "contact_master" | "organisation_master" = "contact_master"
      let processedData: any[] = []

      if (uploadType === "contacts") {
        tableName = "contact_master"
        processedData = jsonData.map((row: any) => ({
          salute: row.salute || null,
          first_name: row.first_name || null,
          last_name: row.last_name || null,
          designation: row.designation || null,
          department: row.department || null,
          job_level: row.job_level || null,
          specialization: row.specialization || null,
          company_id: row.company_id ? parseInt(row.company_id) : null,
          official_email_id: row.official_email_id || null,
          personal_email_id: row.personal_email_id || null,
          mobile_number: row.mobile_number || null,
          direct_phone_number: row.direct_phone_number || null,
          gender: row.gender || null,
        }))
      } else {
        tableName = "organisation_master"
        processedData = jsonData.map((row: any) => ({
          company_name: row.company_name || null,
          industry: row.industry || null,
          headquarters: row.headquarters || null,
          employees: row.employees ? parseInt(row.employees) : null,
          annual_revenue: row.annual_revenue ? parseFloat(row.annual_revenue) : null,
          address_type: row.address_type || null,
          postal_address_1: row.postal_address_1 || null,
          postal_address_2: row.postal_address_2 || null,
          postal_address_3: row.postal_address_3 || null,
          std: row.std || null,
          phone_1: row.phone_1 || null,
          phone_2: row.phone_2 || null,
          fax: row.fax || null,
          company_mobile_number: row.company_mobile_number || null,
          common_email_id: row.common_email_id || null,
          website: row.website || null,
          no_of_employees_total: row.no_of_employees_total ? parseInt(row.no_of_employees_total) : null,
          turn_over_inr_cr: row.turn_over_inr_cr ? parseFloat(row.turn_over_inr_cr) : null,
          no_of_offices_total: row.no_of_offices_total ? parseInt(row.no_of_offices_total) : null,
          no_of_branch_offices: row.no_of_branch_offices ? parseInt(row.no_of_branch_offices) : null,
        }))
      }

      const { error } = await supabase
        .from(tableName)
        .insert(processedData)

      if (error) throw error

      toast({
        title: "Success",
        description: `Successfully uploaded ${jsonData.length} ${uploadType}`,
      })

      setOpen(false)
      setFile(null)
      setUploadType("")
      onUploadComplete()
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: `Failed to upload ${uploadType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload</DialogTitle>
          <DialogDescription>
            Upload contacts or companies in bulk using Excel files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="upload_type">Upload Type</Label>
            <Select value={uploadType} onValueChange={(value) => setUploadType(value as "contacts" | "companies")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacts">Contacts</SelectItem>
                <SelectItem value="companies">Companies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploadType && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                Download template for {uploadType}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(uploadType)}
                className="gap-2"
              >
                <Download className="w-3 h-3" />
                Template
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleFileUpload} 
            disabled={loading || !file || !uploadType}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}