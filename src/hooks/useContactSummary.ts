import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface ContactSummary {
  total: number
  with_email: number
  with_mobile: number
  new_30d: number
}

export const useContactSummary = () => {
  return useQuery({
    queryKey: ['contacts:summary'],
    queryFn: async (): Promise<ContactSummary> => {
      const { data, error } = await supabase.rpc('get_contact_summary')
      
      if (error) {
        console.error('Error fetching contact summary:', error)
        throw error
      }

      const summary = data?.[0]
      return {
        total: Number(summary?.total || 0),
        with_email: Number(summary?.with_email || 0),
        with_mobile: Number(summary?.with_mobile || 0),
        new_30d: Number(summary?.new_30d || 0)
      }
    }
  })
}