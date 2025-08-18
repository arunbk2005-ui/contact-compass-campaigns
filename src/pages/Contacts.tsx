import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { AddContactDialog } from "@/components/forms/AddContactDialog"
import { EditContactDialog } from "@/components/forms/EditContactDialog"
import { BulkUploadDialog } from "@/components/forms/BulkUploadDialog"
import { SummaryTiles } from "@/components/ui/summary-tiles"
import { useContactSummary } from "@/hooks/useContactSummary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Filter,
  Mail,
  Phone,
  Building2,
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
import { useToast } from "@/hooks/use-toast"

interface Contact {
  contact_id: number
  company_id: number | null
  first_name: string | null
  last_name: string | null
  designation: string | null
  department: string | null
  job_level: string | null
  specialization: string | null
  official_email_id: string | null
  personal_email_id: string | null
  direct_phone_number: string | null
  mobile_number: string | null
  gender: string | null
  salute: string | null
  City_ID: number | null
  Email_Optin: string | null
  company_name?: string | null
}

interface ContactKPIs {
  total: number
  withEmail: number
  withPhone: number
  newLast30d: number
}

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Array<{ company_id: number; company_name: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: summary = { total: 0, with_email: 0, with_mobile: 0, new_30d: 0 } } = useContactSummary()

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    
    // Set up realtime subscription for live updates
    const contactsSubscription = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_master'
        },
        () => {
          fetchContacts() // This will also update KPIs
        }
      )
      .subscribe()

    return () => {
      contactsSubscription.unsubscribe()
    }
  }, [])

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_master')
        .select(`
          *,
          organisation_master!contact_master_company_id_fkey(company_name)
        `)
        .order('first_name')
      
      if (error) throw error
      
      const contactsWithCompany = data?.map(contact => ({
        ...contact,
        company_name: contact.organisation_master?.company_name
      })) || []
      
      setContacts(contactsWithCompany)
      queryClient.invalidateQueries({ queryKey: ['contacts:summary'] })
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const { error } = await supabase
        .from('contact_master')
        .delete()
        .eq('contact_id', contactId)

      if (error) throw error

      // The realtime subscription will automatically refresh the data
      queryClient.invalidateQueries({ queryKey: ['contacts:summary'] })
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }


  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('organisation_master')
        .select('company_id, company_name')
        .order('company_name')
      
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const getFullName = (contact: Contact) => {
    const salute = contact.salute ? `${contact.salute} ` : ''
    const firstName = contact.first_name || ''
    const lastName = contact.last_name || ''
    return `${salute}${firstName} ${lastName}`.trim() || 'No Name'
  }

  const getEmail = (contact: Contact) => {
    return contact.official_email_id || contact.personal_email_id || 'No email'
  }

  const getPhone = (contact: Contact) => {
    return contact.mobile_number || contact.direct_phone_number || 'No phone'
  }

  const filteredContacts = contacts.filter(contact => {
    const fullName = getFullName(contact).toLowerCase()
    const email = getEmail(contact).toLowerCase()
    const company = contact.company_name?.toLowerCase() || ''
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           company.includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your contact database and employee information
          </p>
        </div>
        
        <div className="flex gap-2">
          <AddContactDialog 
            onContactAdded={() => {
              fetchContacts()
              queryClient.invalidateQueries({ queryKey: ['contacts:summary'] })
            }} 
            companies={companies} 
          />
          <BulkUploadDialog 
            onUploadComplete={() => {
              fetchContacts()
              queryClient.invalidateQueries({ queryKey: ['contacts:summary'] })
            }} 
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={fetchContacts}
            >
              <Filter className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.contact_id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{getFullName(contact)}</CardTitle>
                  <CardDescription className="text-sm">
                    {contact.designation || contact.job_level || 'Position not specified'}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditContact(contact)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteContact(contact.contact_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{contact.company_name || 'Company not specified'}</span>
              </div>
              
              {contact.department && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Department: </span>
                  <span className="text-foreground">{contact.department}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground truncate">{getEmail(contact)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{getPhone(contact)}</span>
              </div>
              
              {contact.specialization && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Specialization: </span>
                  <span className="text-foreground">{contact.specialization}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Summary */}
      <SummaryTiles
        title="Contact Summary"
        tiles={[
          {
            title: "Total",
            value: summary.total,
            description: "Total Contacts",
            colorClass: "text-foreground"
          },
          {
            title: "With Email",
            value: summary.with_email,
            description: "With Email",
            colorClass: "text-success"
          },
          {
            title: "With Mobile",
            value: summary.with_mobile,
            description: "With Mobile",
            colorClass: "text-primary"
          },
          {
            title: "New 30d",
            value: summary.new_30d,
            description: "New (Last 30d)",
            colorClass: "text-accent"
          }
        ]}
      />

      {/* Edit Contact Dialog */}
      {editContact && (
        <EditContactDialog
          contact={editContact}
          companies={companies}
          open={!!editContact}
          onOpenChange={(open) => !open && setEditContact(null)}
          onContactUpdated={() => {
            fetchContacts()
            queryClient.invalidateQueries({ queryKey: ['contacts:summary'] })
          }}
        />
      )}
    </div>
  )
}

export default Contacts