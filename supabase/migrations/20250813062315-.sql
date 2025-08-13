-- Create table to track allocations of audience runs to campaigns
CREATE TABLE IF NOT EXISTS public.campaign_audience_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  run_id UUID NOT NULL REFERENCES public.audience_runs(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  allocated_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  UNIQUE (run_id, campaign_id)
);

-- Enable RLS
ALTER TABLE public.campaign_audience_allocations ENABLE ROW LEVEL SECURITY;

-- Policies: creator can manage their rows; admins can manage all
CREATE POLICY IF NOT EXISTS "Allocations - creator manage own" 
ON public.campaign_audience_allocations
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Allocations - admins manage all" 
ON public.campaign_audience_allocations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to auto-update updated_at
CREATE TRIGGER IF NOT EXISTS update_campaign_audience_allocations_updated_at
BEFORE UPDATE ON public.campaign_audience_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
