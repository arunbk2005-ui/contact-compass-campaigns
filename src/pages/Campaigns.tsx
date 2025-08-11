import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  list_size: number;
  client_name: string;
  servicing_lead: string;
  created_at: string;
  updated_at: string;
}

export default function Campaigns() {
  // SEO basics
  useEffect(() => {
    const title = "Campaigns | Manage marketing campaigns";
    const description = "Create, edit, and manage campaigns with dates, client, list size, and servicing lead.";
    document.title = title;

    const metaName = "description";
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", metaName);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    const canonicalHref = `${window.location.origin}/campaigns`;
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalHref);
  }, []);

  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [listSize, setListSize] = useState("");
  const [clientName, setClientName] = useState("");
  const [servicingLead, setServicingLead] = useState("");

  const isCreateDisabled = useMemo(() => {
    if (!name || !startDate || !endDate || !clientName || !servicingLead) return true;
    const ls = Number.parseInt(listSize || "0", 10);
    if (Number.isNaN(ls) || ls < 0) return true;
    return new Date(endDate) < new Date(startDate);
  }, [name, startDate, endDate, listSize, clientName, servicingLead]);

  async function fetchCampaigns() {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(`Failed to load campaigns: ${error.message}`);
      return;
    }
    setCampaigns((data as Campaign[]) || []);
  }

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (isCreateDisabled) return;
    setLoading(true);
    const { error } = await supabase.from("campaigns").insert([
      {
        name,
        start_date: startDate,
        end_date: endDate,
        list_size: Number.parseInt(listSize, 10),
        client_name: clientName,
        servicing_lead: servicingLead,
      },
    ]);
    setLoading(false);
    if (error) {
      toast.error(`Failed to create campaign: ${error.message}`);
      return;
    }
    toast.success("Campaign created");
    setName("");
    setStartDate("");
    setEndDate("");
    setListSize("");
    setClientName("");
    setServicingLead("");
    fetchCampaigns();
  }

  return (
    <div>
      <header className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create, edit, and manage your campaigns
        </p>
      </header>

      <main className="p-6 space-y-6">
        <section aria-labelledby="create-campaign">
          <Card>
            <CardHeader>
              <CardTitle id="create-campaign">Create a new campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client name</Label>
                  <Input id="client" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead">Servicing lead</Label>
                  <Input id="lead" value={servicingLead} onChange={(e) => setServicingLead(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Start date</Label>
                  <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End date</Label>
                  <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listSize">Campaign list size</Label>
                  <Input id="listSize" type="number" min={0} value={listSize} onChange={(e) => setListSize(e.target.value)} required />
                </div>
                <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
                  <Button type="submit" disabled={loading || isCreateDisabled}>
                    {loading ? "Creating..." : "Create campaign"}
                  </Button>
                </div>
                {isCreateDisabled && startDate && endDate && new Date(endDate) < new Date(startDate) && (
                  <p className="text-sm text-destructive md:col-span-3">End date cannot be before start date.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="campaign-list">
          <Card>
            <CardHeader>
              <CardTitle id="campaign-list">All campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead className="text-right">List size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <CampaignRow key={c.id} campaign={c} onChanged={fetchCampaigns} />
                    ))}
                    {campaigns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No campaigns yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function CampaignRow({ campaign, onChanged }: { campaign: Campaign; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(campaign.name);
  const [clientName, setClientName] = useState(campaign.client_name);
  const [servicingLead, setServicingLead] = useState(campaign.servicing_lead);
  const [start, setStart] = useState(campaign.start_date);
  const [end, setEnd] = useState(campaign.end_date);
  const [listSize, setListSize] = useState(String(campaign.list_size));
  const [saving, setSaving] = useState(false);

  const invalid = useMemo(() => {
    if (!name || !clientName || !servicingLead || !start || !end) return true;
    const ls = Number.parseInt(listSize || "0", 10);
    if (Number.isNaN(ls) || ls < 0) return true;
    return new Date(end) < new Date(start);
  }, [name, clientName, servicingLead, start, end, listSize]);

  async function handleSave() {
    if (invalid) return;
    setSaving(true);
    const { error } = await supabase
      .from("campaigns")
      .update({
        name,
        client_name: clientName,
        servicing_lead: servicingLead,
        start_date: start,
        end_date: end,
        list_size: Number.parseInt(listSize, 10),
      })
      .eq("id", campaign.id);
    setSaving(false);
    if (error) {
      toast.error(`Failed to update: ${error.message}`);
      return;
    }
    toast.success("Campaign updated");
    setOpen(false);
    onChanged();
  }

  async function handleDelete() {
    const { error } = await supabase.from("campaigns").delete().eq("id", campaign.id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    toast.success("Campaign deleted");
    onChanged();
  }

  return (
    <TableRow>
      <TableCell>{campaign.name}</TableCell>
      <TableCell>{campaign.client_name}</TableCell>
      <TableCell>{campaign.servicing_lead}</TableCell>
      <TableCell>{campaign.start_date}</TableCell>
      <TableCell>{campaign.end_date}</TableCell>
      <TableCell className="text-right">{campaign.list_size}</TableCell>
      <TableCell className="text-right space-x-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit campaign</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${campaign.id}`}>Campaign name</Label>
                <Input id={`name-${campaign.id}`} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`client-${campaign.id}`}>Client name</Label>
                <Input id={`client-${campaign.id}`} value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lead-${campaign.id}`}>Servicing lead</Label>
                <Input id={`lead-${campaign.id}`} value={servicingLead} onChange={(e) => setServicingLead(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`start-${campaign.id}`}>Start date</Label>
                <Input id={`start-${campaign.id}`} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-${campaign.id}`}>End date</Label>
                <Input id={`end-${campaign.id}`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`size-${campaign.id}`}>List size</Label>
                <Input id={`size-${campaign.id}`} type="number" min={0} value={listSize} onChange={(e) => setListSize(e.target.value)} />
              </div>
              {invalid && start && end && new Date(end) < new Date(start) && (
                <p className="text-sm text-destructive md:col-span-2">End date cannot be before start date.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || invalid}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
