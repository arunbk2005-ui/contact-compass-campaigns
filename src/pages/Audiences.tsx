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
  file_name: z.string().min(1, "Please enter file name"),
  description: z.string().optional(),
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
      // First, create the campaign file
      const { data: campaignFile, error: fileError } = await supabase
        .from('campaign_files')
        .insert({
          campaign_id: data.campaign_id,
          file_name: data.file_name,
          description: data.description,
          total_contacts: parseInt(data.allocated_count),
        })
        .select()
        .single();

      if (fileError || !campaignFile) {
        console.error('Error creating campaign file:', fileError);
        toast.error('Failed to create campaign file');
        return;
      }

      // Get the audience results for this allocation
      const { data: audienceData, error: audienceError } = await supabase
        .rpc('get_audience_results', { p_run_id: selectedRun.id })
        .limit(parseInt(data.allocated_count));

      if (audienceError) {
        console.error('Error fetching audience data:', audienceError);
        toast.error('Failed to fetch audience data for allocation');
        return;
      }

      // Insert the contacts into campaign_file_contacts
      if (audienceData && audienceData.length > 0) {
        const contactsToInsert = audienceData.map((contact: any) => ({
          campaign_file_id: campaignFile.id,
          contact_id: contact.contact_id,
          company_id: contact.company_id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          company_name: contact.company_name,
          city: contact.city,
          state: contact.state,
          industry: contact.industry,
          job_level: contact.job_level,
          department: contact.department,
        }));

        const { error: contactsError } = await supabase
          .from('campaign_file_contacts')
          .insert(contactsToInsert);

        if (contactsError) {
          console.error('Error inserting campaign file contacts:', contactsError);
          toast.error('Failed to allocate contacts to campaign file');
          return;
        }

        // Update the campaign file with actual allocated count
        await supabase
          .from('campaign_files')
          .update({ allocated_contacts: contactsToInsert.length })
          .eq('id', campaignFile.id);
      }

      // Finally, record the allocation
      const { error: allocationError } = await supabase
        .from('campaign_audience_allocations')
        .insert({
          run_id: selectedRun.id,
          campaign_id: data.campaign_id,
          allocated_count: parseInt(data.allocated_count),
        });

      if (allocationError) {
        console.error('Error recording allocation:', allocationError);
        toast.error('Failed to record allocation');
        return;
      }

      toast.success(`Campaign file "${data.file_name}" created with ${audienceData?.length || 0} contacts`);
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
            <DialogTitle>Allocate Audience to Campaign File</DialogTitle>
            <DialogDescription>
              Create a campaign file with contacts from "{selectedRun?.name || 'Untitled Run'}" 
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
                name="file_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign File Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter file name (e.g., Q1_Lead_List)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={allocationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief description of this campaign file" 
                        {...field} 
                      />
                    </FormControl>
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
                  Create Campaign File
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}