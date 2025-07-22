import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AddCompanyDialog } from "@/components/forms/AddCompanyDialog"
import { EditCompanyDialog } from "@/components/forms/EditCompanyDialog"
import { BulkUploadDialog } from "@/components/forms/BulkUploadDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Filter,
  Building2,
  Users,
  MapPin,
  Globe,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('organisation_master')
        .select('*')
        .order('company_name')
      
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSizeColor = (employees: number | null) => {
    if (!employees) return "text-muted-foreground"
    if (employees >= 1000) return "text-success"
    if (employees >= 500) return "text-primary"
    if (employees >= 100) return "text-accent"
    return "text-muted-foreground"
  }

  const formatEmployees = (employees: number | null) => {
    if (!employees) return "Unknown"
    if (employees >= 1000) return "1000+"
    if (employees >= 500) return "500-999"
    if (employees >= 100) return "100-499"
    if (employees >= 50) return "50-99"
    return "< 50"
  }

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return "Not disclosed"
    if (revenue >= 100000000) return "$100M+"
    if (revenue >= 50000000) return "$50M - $100M"
    if (revenue >= 10000000) return "$10M - $50M"
    if (revenue >= 1000000) return "$1M - $10M"
    return "< $1M"
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.headquarters?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-2">
            Manage company profiles and organizational data
          </p>
        </div>
        
        <div className="flex gap-2">
          <AddCompanyDialog onCompanyAdded={fetchCompanies} />
          <BulkUploadDialog onUploadComplete={fetchCompanies} />
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={fetchCompanies}
            >
              <Filter className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.company_id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.company_name || 'Unnamed Company'}</CardTitle>
                    <CardDescription className="text-sm">
                      {company.industry || 'Industry not specified'}
                    </CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditCompany(company)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Company
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Company
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Employees</span>
                  </div>
                  <span className={`font-medium ${getSizeColor(company.employees)}`}>
                    {formatEmployees(company.employees)}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Count</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {company.employees || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{company.headquarters || 'Location not specified'}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Annual Revenue: </span>
                <span className="font-medium text-foreground">{formatRevenue(company.annual_revenue)}</span>
              </div>
              
              <div className="flex items-center justify-end pt-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Company Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{companies.length}</div>
              <div className="text-sm text-muted-foreground">Total Companies</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">{companies.filter(c => c.employees && c.employees >= 500).length}</div>
              <div className="text-sm text-muted-foreground">Large Companies</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">{companies.filter(c => c.annual_revenue && c.annual_revenue >= 10000000).length}</div>
              <div className="text-sm text-muted-foreground">High Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Company Dialog */}
      {editCompany && (
        <EditCompanyDialog
          company={editCompany}
          open={!!editCompany}
          onOpenChange={(open) => !open && setEditCompany(null)}
          onCompanyUpdated={fetchCompanies}
        />
      )}
    </div>
  )
}

export default Companies