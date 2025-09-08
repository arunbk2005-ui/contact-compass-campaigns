import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Target, Users, Building2, Mail, Phone, Plus, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AudienceBuilder from "@/components/AudienceBuilder";

const allocationSchema = z.object({
  campaign_id: z.string().min(1, "Please select a campaign"),
  allocated_count: z.string().min(1, "Please enter allocation count"),
});

type AllocationData = z.infer<typeof allocationSchema>;

interface AudienceRun {
  id: string;
  name: string | null;
  total_results: number;
  created_at: string;
  status: string;
  filters: any;
}

interface AudienceResult {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  job_level: string | null;
  department: string | null;
}

interface Campaign {
  id: string;
  name: string;
  client_name: string;
  list_size: number;
}

export default function Audiences() {
  const [audienceRuns, setAudienceRuns] = useState<AudienceRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AudienceRun | null>(null);
  const [audienceResults, setAudienceResults] = useState<AudienceResult[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);

  const allocationForm = useForm<AllocationData>({
    resolver: zodResolver(allocationSchema),
  });

  useEffect(() => {
    fetchAudienceRuns();
    fetchCampaigns();
  }, []);

  const fetchAudienceRuns = async () => {
    try {
      const { data, error } = await supabase
        .from('audience_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audience runs:', error);
        toast.error('Failed to fetch audience runs');
        return;
      }

      setAudienceRuns(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch audience runs');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, client_name, list_size');

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAudienceResults = async (runId: string) => {
    setResultsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_audience_results', {
        p_run_id: runId
      });

      if (error) {
        console.error('Error fetching audience results:', error);
        toast.error('Failed to fetch audience results');
        return;
      }

      setAudienceResults(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch audience results');
    } finally {
      setResultsLoading(false);
    }
  };

  const onAllocationSubmit = async (data: AllocationData) => {
    if (!selectedRun) return;

    try {
      // Fetch audience data for the run with all joined details  
      const { data: audienceData, error: audienceError } = await supabase
        .rpc('get_audience_results', { p_run_id: selectedRun.id })
        .limit(parseInt(data.allocated_count));

      if (audienceError) {
        console.error('Error fetching audience data:', audienceError);
        toast.error('Failed to fetch audience data');
        return;
      }

      if (!audienceData || audienceData.length === 0) {
        toast.error('No audience data found for this run');
        return;
      }

      // Get additional contact and company details for each contact
      const contactIds = audienceData.map((item: any) => item.contact_id);
      
      // Fetch contact master details
      const { data: contactDetails, error: contactError } = await supabase
        .from('contact_master')
        .select('*')
        .in('contact_id', contactIds);

      // Fetch company master details
      const companyIds = audienceData.map((item: any) => item.company_id).filter(Boolean);
      const { data: companyDetails, error: companyError } = await supabase
        .from('organisation_master')
        .select('*')
        .in('company_id', companyIds);

      if (contactError || companyError) {
        console.error('Error fetching details:', contactError || companyError);
        toast.error('Failed to fetch contact/company details');
        return;
      }

      // Create allocations with complete data
      const allocationsToInsert = audienceData.map((item: any) => {
        const contactDetail = contactDetails?.find(c => c.contact_id === item.contact_id);
        const companyDetail = companyDetails?.find(c => c.company_id === item.company_id);

        return {
          campaign_id: data.campaign_id,
          run_id: selectedRun.id,
          contact_id: item.contact_id,
          // Contact fields
          first_name: item.first_name,
          last_name: item.last_name,
          salute: contactDetail?.salute || null,
          designation: contactDetail?.designation || null,
          department: item.department,
          job_level: item.job_level,
          specialization: contactDetail?.specialization || null,
          official_email_id: contactDetail?.official_email_id || null,
          personal_email_id: contactDetail?.personal_email_id || null,
          direct_phone_number: contactDetail?.direct_phone_number || null,
          mobile_number: contactDetail?.mobile_number || null,
          gender: contactDetail?.gender || null,
          email_optin: contactDetail?.Email_Optin || null,
          // Company fields
          company_id: item.company_id,
          company_name: item.company_name,
          industry: item.industry,
          headquarters: companyDetail?.headquarters || null,
          website: companyDetail?.website || null,
          no_of_employees_total: companyDetail?.no_of_employees_total || null,
          turn_over_inr_cr: companyDetail?.turn_over_inr_cr || null,
          annual_revenue: companyDetail?.annual_revenue || null,
          // Location fields
          city_id: item.city_id,
          city: item.city,
          state: item.state,
          postal_address_1: companyDetail?.postal_address_1 || null,
          postal_address_2: companyDetail?.postal_address_2 || null,
          postal_address_3: companyDetail?.postal_address_3 || null,
          // Contact info
          std: companyDetail?.std || null,
          phone_1: companyDetail?.phone_1 || null,
          phone_2: companyDetail?.phone_2 || null,
          fax: companyDetail?.fax || null,
          company_mobile_number: companyDetail?.company_mobile_number || null,
          common_email_id: companyDetail?.common_email_id || null,
        };
      });

      const { error: allocationError } = await supabase
        .from('campaign_allocations')
        .insert(allocationsToInsert);

      if (allocationError) {
        console.error('Error creating campaign allocation:', allocationError);
        toast.error('Failed to allocate audience to campaign');
        return;
      }

      toast.success(`Successfully allocated ${audienceData.length} contacts to campaign`);
      setShowAllocationDialog(false);
      allocationForm.reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to allocate audience to campaign');
    }
  };

  const handleViewResults = (run: AudienceRun) => {
    setSelectedRun(run);
    fetchAudienceResults(run.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audiences</h1>
          <p className="text-muted-foreground">Build and manage targeted audiences for your campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Audience Builder</TabsTrigger>
          <TabsTrigger value="runs">Audience Runs</TabsTrigger>
          {selectedRun && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>

        <TabsContent value="builder">
          <AudienceBuilder onAudienceSaved={fetchAudienceRuns} />
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Audience Runs</CardTitle>
              <CardDescription>
                View and manage your built audiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audienceRuns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No audience runs found. Build your first audience using the Audience Builder.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {audienceRuns.map((run) => (
                      <Card key={run.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{run.name || 'Untitled Run'}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {run.total_results} contacts
                                </span>
                                <span>Created {new Date(run.created_at).toLocaleDateString()}</span>
                                <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                                  {run.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResults(run)}
                              >
                                View Results
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRun(run);
                                  setShowAllocationDialog(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Allocate
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedRun && (
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Audience Results</CardTitle>
                <CardDescription>
                  Results for: {selectedRun.name || 'Untitled Run'} ({selectedRun.total_results} contacts)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-8">Loading results...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Job Level</TableHead>
                          <TableHead>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audienceResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              {result.first_name && result.last_name 
                                ? `${result.first_name} ${result.last_name}` 
                                : result.first_name || result.last_name || '-'}
                            </TableCell>
                            <TableCell>
                              {result.email ? (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-green-600" />
                                  {result.email}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {result.phone ? (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-blue-600" />
                                  {result.phone}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {result.company_name ? (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {result.company_name}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {result.city && result.state ? `${result.city}, ${result.state}` : result.city || result.state || '-'}
                            </TableCell>
                            <TableCell>{result.job_level || '-'}</TableCell>
                            <TableCell>{result.department || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Audience to Campaign</DialogTitle>
            <DialogDescription>
              Allocate contacts from "{selectedRun?.name || 'Untitled Run'}" to a campaign
              ({selectedRun?.total_results.toLocaleString()} total contacts available)
            </DialogDescription>
          </DialogHeader>
          <Form {...allocationForm}>
            <form onSubmit={allocationForm.handleSubmit(onAllocationSubmit)} className="space-y-4">
              <FormField
                control={allocationForm.control}
                name="campaign_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name} - {campaign.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={allocationForm.control}
                name="allocated_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Contacts to Allocate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter count" 
                        max={selectedRun?.total_results || 0}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAllocationDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Allocate to Campaign
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}