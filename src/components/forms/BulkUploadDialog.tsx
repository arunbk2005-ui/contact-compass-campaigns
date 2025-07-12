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
      headers = ["company_name", "industry", "employees", "headquarters", "annual_revenue"]
      sampleData = [
        {
          company_name: "Tech Corp Inc.",
          industry: "Technology",
          employees: 500,
          headquarters: "San Francisco, CA",
          annual_revenue: 50000000
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
          employees: row.employees ? parseInt(row.employees) : null,
          headquarters: row.headquarters || null,
          annual_revenue: row.annual_revenue ? parseFloat(row.annual_revenue) : null,
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