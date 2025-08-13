import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Filter, Download, Plus, Target, Users, Building2, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const basicFiltersSchema = z.object({
  industry: z.string().optional(),
  city_id: z.string().optional(),
  job_level: z.string().optional(),
  department: z.string().optional(),
  has_email: z.boolean().default(false),
  has_phone: z.boolean().default(false),
  employee_min: z.string().optional(),
  employee_max: z.string().optional(),
  text_search: z.string().optional(),
});

const allocationSchema = z.object({
  campaign_id: z.string().min(1, "Please select a campaign"),
  allocated_count: z.string().min(1, "Please enter allocation count"),
});

type BasicFilters = z.infer<typeof basicFiltersSchema>;
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
  const [industries, setIndustries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [jobLevels, setJobLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);

  const basicForm = useForm<BasicFilters>({
    resolver: zodResolver(basicFiltersSchema),
    defaultValues: {
      has_email: false,
      has_phone: false,
    },
  });

  const allocationForm = useForm<AllocationData>({
    resolver: zodResolver(allocationSchema),
  });

  useEffect(() => {
    fetchAudienceRuns();
    fetchCampaigns();
    fetchDropdownData();
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

  const fetchDropdownData = async () => {
    try {
      const [industriesRes, citiesRes, departmentsRes, jobLevelsRes] = await Promise.all([
        supabase.from('industry_master').select('*'),
        supabase.from('city_master').select('*'),
        supabase.from('department_master').select('*'),
        supabase.from('job_level_master').select('*'),
      ]);

      setIndustries(industriesRes.data || []);
      setCities(citiesRes.data || []);
      setDepartments(departmentsRes.data || []);
      setJobLevels(jobLevelsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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

  const onBasicFiltersSubmit = async (data: BasicFilters) => {
    setLoading(true);
    try {
      const filters = {
        ...data,
        city_id: data.city_id ? parseInt(data.city_id) : undefined,
        employee_min: data.employee_min ? parseInt(data.employee_min) : undefined,
        employee_max: data.employee_max ? parseInt(data.employee_max) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === '') {
          delete filters[key as keyof typeof filters];
        }
      });

      const { data: runId, error } = await supabase.rpc('build_audience', {
        p_filters: filters,
        p_run_name: `Audience Run ${new Date().toLocaleString()}`,
        p_save: true
      });

      if (error) {
        console.error('Error building audience:', error);
        toast.error('Failed to build audience');
        return;
      }

      toast.success('Audience built successfully');
      fetchAudienceRuns();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to build audience');
    } finally {
      setLoading(false);
    }
  };

  const onAllocationSubmit = async (data: AllocationData) => {
    if (!selectedRun) return;

    try {
      const { error } = await supabase
        .from('campaign_audience_allocations')
        .insert({
          run_id: selectedRun.id,
          campaign_id: data.campaign_id,
          allocated_count: parseInt(data.allocated_count),
        });

      if (error) {
        console.error('Error allocating audience:', error);
        toast.error('Failed to allocate audience to campaign');
        return;
      }

      toast.success('Audience allocated to campaign successfully');
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Basic Filters
              </CardTitle>
              <CardDescription>
                Create a targeted audience using basic filtering criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(onBasicFiltersSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={basicForm.control}
                      name="text_search"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Search</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search companies, contacts..."
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry.industry_id} value={industry.industry_vertical || ''}>
                                  {industry.industry_vertical}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="city_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.city_id} value={city.city_id.toString()}>
                                  {city.city}, {city.state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="job_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {jobLevels.map((level) => (
                                <SelectItem key={level.id} value={level.job_level_name}>
                                  {level.job_level_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.department_name}>
                                  {dept.department_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <FormField
                        control={basicForm.control}
                        name="employee_min"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Min Employees</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicForm.control}
                        name="employee_max"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Max Employees</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Max" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <FormField
                      control={basicForm.control}
                      name="has_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Has Email</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="has_phone"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Has Phone</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Building..." : "Build Audience"}
                    <Target className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
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
                  Allocate
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}