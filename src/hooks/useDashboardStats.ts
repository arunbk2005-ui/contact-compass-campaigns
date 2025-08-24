import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface DashboardStats {
  totalContacts: number
  totalCompanies: number
  activeCampaigns: number
  responseRate: number
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard:stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date().toISOString()

      const [
        { count: contactCount, error: contactError },
        { count: companyCount, error: companyError },
        { count: campaignCount, error: campaignError }
      ] = await Promise.all([
        supabase.from("contact_master").select("*", { count: "exact", head: true }),
        supabase.from("organisation_master").select("*", { count: "exact", head: true }),
        supabase
          .from("campaigns")
          .select("*", { count: "exact", head: true })
          .lte("start_date", now)
          .gte("end_date", now)
      ])

      if (contactError) throw contactError
      if (companyError) throw companyError
      if (campaignError) throw campaignError

      return {
        totalContacts: contactCount || 0,
        totalCompanies: companyCount || 0,
        activeCampaigns: campaignCount || 0,
        responseRate: 0
      }
    }
  })
}

