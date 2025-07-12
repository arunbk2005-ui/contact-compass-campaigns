import { useState } from "react"
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

const mockCompanies = [
  {
    id: 1,
    name: "TechCorp Inc.",
    industry: "Technology",
    size: "500-1000",
    location: "San Francisco, CA",
    website: "techcorp.com",
    contacts: 15,
    revenue: "$50M - $100M",
    status: "active"
  },
  {
    id: 2,
    name: "Innovate Solutions",
    industry: "SaaS",
    size: "100-500",
    location: "Austin, TX",
    website: "innovate.com",
    contacts: 8,
    revenue: "$10M - $50M",
    status: "prospect"
  },
  {
    id: 3,
    name: "StartupX",
    industry: "Fintech",
    size: "10-50",
    location: "New York, NY",
    website: "startupx.io",
    contacts: 3,
    revenue: "$1M - $10M",
    status: "engaged"
  },
  {
    id: 4,
    name: "Enterprise Co.",
    industry: "Manufacturing",
    size: "1000+",
    location: "Chicago, IL",
    website: "enterprise.co",
    contacts: 25,
    revenue: "$100M+",
    status: "active"
  }
]

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground"
      case "engaged": return "bg-primary text-primary-foreground"
      case "prospect": return "bg-warning text-warning-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getSizeColor = (size: string) => {
    if (size.includes("1000+")) return "text-success"
    if (size.includes("500-1000")) return "text-primary"
    if (size.includes("100-500")) return "text-accent"
    return "text-muted-foreground"
  }

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || company.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Companies
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("engaged")}>
                  Engaged
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("prospect")}>
                  Prospect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {company.industry}
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
                    <DropdownMenuItem>
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
                    <span className="text-muted-foreground">Size</span>
                  </div>
                  <span className={`font-medium ${getSizeColor(company.size)}`}>
                    {company.size}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contacts</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {company.contacts}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{company.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{company.website}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Revenue: </span>
                <span className="font-medium text-foreground">{company.revenue}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Badge className={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{mockCompanies.length}</div>
              <div className="text-sm text-muted-foreground">Total Companies</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">{mockCompanies.filter(c => c.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockCompanies.filter(c => c.status === 'engaged').length}</div>
              <div className="text-sm text-muted-foreground">Engaged</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">{mockCompanies.filter(c => c.status === 'prospect').length}</div>
              <div className="text-sm text-muted-foreground">Prospects</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Companies