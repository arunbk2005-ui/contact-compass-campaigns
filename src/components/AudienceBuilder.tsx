import { useState, useEffect, useCallback } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Filter, Save, Eye, Users, Mail, Phone, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";
const audienceFiltersSchema = z.object({
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

const saveAudienceSchema = z.object({
  name: z.string().min(1, "Audience name is required"),
  notes: z.string().optional(),
});

type AudienceFilters = z.infer<typeof audienceFiltersSchema>;
type SaveAudienceData = z.infer<typeof saveAudienceSchema>;

type Industry = Database["public"]["Tables"]["industry_master"]["Row"];
type City = Database["public"]["Tables"]["city_master"]["Row"];
type Department = Database["public"]["Tables"]["department_master"]["Row"];
type JobLevel = Database["public"]["Tables"]["job_level_master"]["Row"];

interface PreviewResult {
  contact_id: number;
  company_id?: number; // optional (not used in UI)
  company_name: string | null;
  // Support both legacy RPC (first_name/last_name/phone) and new RPC (full_name/mobile)
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email: string | null;
  phone?: string | null;
  mobile?: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  job_level: string | null;
  department: string | null;
  total_count: number;
}

interface DropdownData {
  industries: Industry[];
  cities: City[];
  departments: Department[];
  jobLevels: JobLevel[];
}

interface AudienceBuilderProps {
  onAudienceSaved?: () => void;
}

const pruneEmpty = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    const arr = obj
      .map(pruneEmpty)
      .filter((v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0));
    return arr.length ? arr : undefined;
  }
  if (obj && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => [k, pruneEmpty(v)] as const)
      .filter(
        ([, v]) =>
          v !== undefined &&
          v !== null &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0)
      );
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (obj === "" || obj === null || obj === undefined || obj === false) return undefined;
  return obj;
};

export default function AudienceBuilder({ onAudienceSaved }: AudienceBuilderProps) {
  const [previewResults, setPreviewResults] = useState<PreviewResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    industries: [],
    cities: [],
    departments: [],
    jobLevels: [],
  });

  const filtersForm = useForm<AudienceFilters>({
    resolver: zodResolver(audienceFiltersSchema),
    defaultValues: {
      industry: "",
      city_id: "",
      job_level: "",
      department: "",
      has_email: false,
      has_phone: false,
      employee_min: "",
      employee_max: "",
      text_search: "",
    },
  });

  const saveForm = useForm<SaveAudienceData>({
    resolver: zodResolver(saveAudienceSchema),
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [industriesRes, citiesRes, departmentsRes, jobLevelsRes] = await Promise.all([
        supabase.from('industry_master').select('*'),
        supabase.from('city_master').select('*'),
        supabase.from('department_master').select('*'),
        supabase.from('job_level_master').select('*'),
      ]);

      setDropdownData({
        industries: industriesRes.data || [],
        cities: citiesRes.data || [],
        departments: departmentsRes.data || [],
        jobLevels: jobLevelsRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const previewAudience = useCallback(async (page: number = 1) => {
    setPreviewLoading(true);
    try {
      const formData = filtersForm.getValues();
      const filters = {
        ...formData,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
        employee_min: formData.employee_min ? parseInt(formData.employee_min) : undefined,
        employee_max: formData.employee_max ? parseInt(formData.employee_max) : undefined,
      };

      // Clean filters: remove empty strings, null/undefined, empty arrays/objects
      const cleaned = pruneEmpty(filters) ?? {};

      const safePage = Math.max(1, page || 1);
      const safePageSize = Math.max(10, Math.min(200, pageSize || 20));

      const { data, error } = await supabase.rpc('search_audience', {
        p_filters: cleaned as any,
        p_page: safePage,
        p_page_size: safePageSize,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to preview audience');
    } finally {
      setPreviewLoading(false);
    }
  }, [filtersForm, pageSize]);

  const onFiltersChange = useCallback(() => {
    setCurrentPage(1);
    setRunId(null);
    previewAudience(1);
  }, [previewAudience]);

  const clearFilters = () => {
    filtersForm.reset({ has_email: false, has_phone: false });
    setPreviewResults([]);
    setTotalCount(0);
    setRunId(null);
  };

  const saveAudience = async (saveData: SaveAudienceData) => {
    setSaveLoading(true);
    try {
      let finalRunId = runId;
      if (!finalRunId) {
        const formData = filtersForm.getValues();
        const filters = {
          ...formData,
          city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
          employee_min: formData.employee_min ? parseInt(formData.employee_min) : undefined,
          employee_max: formData.employee_max ? parseInt(formData.employee_max) : undefined,
        };
        const cleaned = pruneEmpty(filters) ?? {};
        const { data: builtRunId, error: buildError } = await supabase.rpc('build_audience', {
          p_filters: cleaned as any,
          p_save: true,
        });
        if (buildError || !builtRunId) {
          console.error('Error building audience run for save:', buildError);
          toast.error('Failed to build audience');
          return;
        }
        finalRunId = builtRunId;
        setRunId(builtRunId);
      }

      const { error } = await supabase
        .from('audience_runs')
        .update({ name: saveData.name, notes: saveData.notes })
        .eq('id', finalRunId);

      if (error) {
        console.error('Error saving audience:', error);
        toast.error('Failed to save audience');
        return;
      }

      toast.success('Audience saved successfully');
      setShowSaveDialog(false);
      saveForm.reset();
      onAudienceSaved?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save audience');
    } finally {
      setSaveLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Audience Builder
          </CardTitle>
          <CardDescription>
            Create targeted audiences with real-time preview and server-side filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...filtersForm}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={filtersForm.control}
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
                            onChange={(e) => {
                              field.onChange(e);
                              onFiltersChange();
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtersForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onFiltersChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropdownData.industries.map((industry) => (
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
                  control={filtersForm.control}
                  name="city_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onFiltersChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropdownData.cities.map((city) => (
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
                  control={filtersForm.control}
                  name="job_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Level</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onFiltersChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropdownData.jobLevels.map((level) => (
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
                  control={filtersForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onFiltersChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropdownData.departments.map((dept) => (
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
                    control={filtersForm.control}
                    name="employee_min"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Min Employees</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Min"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onFiltersChange();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={filtersForm.control}
                    name="employee_max"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Max Employees</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Max"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onFiltersChange();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <FormField
                  control={filtersForm.control}
                  name="has_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            onFiltersChange();
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Has Email
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtersForm.control}
                  name="has_phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            onFiltersChange();
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Has Phone
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {totalCount.toLocaleString()} contacts found
                  </Badge>
                  {previewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    disabled={previewLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => previewAudience(currentPage)}
                    disabled={previewLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          disabled={previewLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Audience
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Audience</DialogTitle>
                        <DialogDescription>
                          Save this audience with {totalCount.toLocaleString()} contacts for future use
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...saveForm}>
                        <form onSubmit={saveForm.handleSubmit(saveAudience)} className="space-y-4">
                          <FormField
                            control={saveForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Audience Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter audience name..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={saveForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Add notes about this audience..."
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowSaveDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={saveLoading}>
                              {saveLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Save Audience
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {totalCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Results
            </CardTitle>
            <CardDescription>
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewResults.map((result) => (
                    <TableRow key={result.contact_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {result.full_name || [result.first_name, result.last_name].filter(Boolean).join(' ') || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">{result.job_level}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.company_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{result.industry}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {[result.city, result.state].filter(Boolean).join(', ') || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{result.job_level || 'N/A'}</div>
                          <div className="text-muted-foreground">{result.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {result.email && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {(result.phone || result.mobile) && (
                            <Badge variant="outline" className="text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              Phone
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => previewAudience(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => previewAudience(page)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => previewAudience(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}