export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      allowed_companies: {
        Row: {
          company_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      audience_results: {
        Row: {
          city: string | null
          city_id: number | null
          company_id: number | null
          company_name: string | null
          contact_id: number | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          id: number
          industry: string | null
          job_level: string | null
          last_name: string | null
          phone: string | null
          run_id: string
          state: string | null
        }
        Insert: {
          city?: string | null
          city_id?: number | null
          company_id?: number | null
          company_name?: string | null
          contact_id?: number | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          industry?: string | null
          job_level?: string | null
          last_name?: string | null
          phone?: string | null
          run_id: string
          state?: string | null
        }
        Update: {
          city?: string | null
          city_id?: number | null
          company_id?: number | null
          company_name?: string | null
          contact_id?: number | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          industry?: string | null
          job_level?: string | null
          last_name?: string | null
          phone?: string | null
          run_id?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "audience_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_runs: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string | null
          notes: string | null
          source: string
          status: string
          total_results: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name?: string | null
          notes?: string | null
          source?: string
          status?: string
          total_results?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string | null
          notes?: string | null
          source?: string
          status?: string
          total_results?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaign_audience_allocations: {
        Row: {
          allocated_count: number
          campaign_id: string
          created_at: string
          created_by: string
          id: string
          run_id: string
          updated_at: string
        }
        Insert: {
          allocated_count?: number
          campaign_id: string
          created_at?: string
          created_by?: string
          id?: string
          run_id: string
          updated_at?: string
        }
        Update: {
          allocated_count?: number
          campaign_id?: string
          created_at?: string
          created_by?: string
          id?: string
          run_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_audience_allocations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_audience_allocations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "audience_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_name: string
          created_at: string
          end_date: string
          id: string
          list_size: number
          name: string
          servicing_lead: string
          start_date: string
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          end_date: string
          id?: string
          list_size: number
          name: string
          servicing_lead: string
          start_date: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          end_date?: string
          id?: string
          list_size?: number
          name?: string
          servicing_lead?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_master: {
        Row: {
          city: string | null
          city_id: number
          country: string | null
          pincode: string | null
          region: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          city_id?: number
          country?: string | null
          pincode?: string | null
          region?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          city_id?: number
          country?: string | null
          pincode?: string | null
          region?: string | null
          state?: string | null
        }
        Relationships: []
      }
      comp_turnover_master: {
        Row: {
          created_at: string
          id: number
          turnover_range: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          turnover_range: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          turnover_range?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_master: {
        Row: {
          City_ID: number | null
          company_id: number | null
          contact_id: number
          department: string | null
          designation: string | null
          direct_phone_number: string | null
          Email_Optin: string | null
          first_name: string | null
          gender: string | null
          job_level: string | null
          last_name: string | null
          mobile_number: string | null
          official_email_id: string | null
          personal_email_id: string | null
          salute: string | null
          specialization: string | null
        }
        Insert: {
          City_ID?: number | null
          company_id?: number | null
          contact_id?: number
          department?: string | null
          designation?: string | null
          direct_phone_number?: string | null
          Email_Optin?: string | null
          first_name?: string | null
          gender?: string | null
          job_level?: string | null
          last_name?: string | null
          mobile_number?: string | null
          official_email_id?: string | null
          personal_email_id?: string | null
          salute?: string | null
          specialization?: string | null
        }
        Update: {
          City_ID?: number | null
          company_id?: number | null
          contact_id?: number
          department?: string | null
          designation?: string | null
          direct_phone_number?: string | null
          Email_Optin?: string | null
          first_name?: string | null
          gender?: string | null
          job_level?: string | null
          last_name?: string | null
          mobile_number?: string | null
          official_email_id?: string | null
          personal_email_id?: string | null
          salute?: string | null
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_master_City_ID_fkey"
            columns: ["City_ID"]
            isOneToOne: false
            referencedRelation: "city_master"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "contact_master_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "organisation_master"
            referencedColumns: ["company_id"]
          },
        ]
      }
      department_master: {
        Row: {
          created_at: string
          department_name: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_name: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_name?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      emp_range_master: {
        Row: {
          created_at: string
          employee_range: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_range: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_range?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      industry_master: {
        Row: {
          industry_id: number
          industry_vertical: string | null
          sub_vertical: string | null
        }
        Insert: {
          industry_id: number
          industry_vertical?: string | null
          sub_vertical?: string | null
        }
        Update: {
          industry_id?: number
          industry_vertical?: string | null
          sub_vertical?: string | null
        }
        Relationships: []
      }
      job_level_master: {
        Row: {
          created_at: string
          id: number
          job_level_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          job_level_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          job_level_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      organisation_master: {
        Row: {
          address_type: string | null
          annual_revenue: number | null
          city_id: number | null
          common_email_id: string | null
          company_id: number
          company_mobile_number: string | null
          company_name: string | null
          employees: number | null
          fax: string | null
          headquarters: string | null
          industry: string | null
          no_of_branch_offices: number | null
          no_of_employees_total: number | null
          no_of_offices_total: number | null
          phone_1: string | null
          phone_2: string | null
          postal_address_1: string | null
          postal_address_2: string | null
          postal_address_3: string | null
          std: string | null
          turn_over_inr_cr: number | null
          website: string | null
        }
        Insert: {
          address_type?: string | null
          annual_revenue?: number | null
          city_id?: number | null
          common_email_id?: string | null
          company_id?: never
          company_mobile_number?: string | null
          company_name?: string | null
          employees?: number | null
          fax?: string | null
          headquarters?: string | null
          industry?: string | null
          no_of_branch_offices?: number | null
          no_of_employees_total?: number | null
          no_of_offices_total?: number | null
          phone_1?: string | null
          phone_2?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_address_3?: string | null
          std?: string | null
          turn_over_inr_cr?: number | null
          website?: string | null
        }
        Update: {
          address_type?: string | null
          annual_revenue?: number | null
          city_id?: number | null
          common_email_id?: string | null
          company_id?: never
          company_mobile_number?: string | null
          company_name?: string | null
          employees?: number | null
          fax?: string | null
          headquarters?: string | null
          industry?: string | null
          no_of_branch_offices?: number | null
          no_of_employees_total?: number | null
          no_of_offices_total?: number | null
          phone_1?: string | null
          phone_2?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_address_3?: string | null
          std?: string | null
          turn_over_inr_cr?: number | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      build_audience: {
        Args: { p_filters: Json; p_run_name?: string; p_save?: boolean }
        Returns: string
      }
      get_audience_results: {
        Args: { p_run_id: string }
        Returns: {
          city: string | null
          city_id: number | null
          company_id: number | null
          company_name: string | null
          contact_id: number | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          id: number
          industry: string | null
          job_level: string | null
          last_name: string | null
          phone: string | null
          run_id: string
          state: string | null
        }[]
      }
      get_contact_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          new_30d: number
          total: number
          with_email: number
          with_mobile: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      preview_audience: {
        Args: { p_filters?: Json; p_limit?: number; p_offset?: number }
        Returns: {
          city: string
          city_id: number
          company_id: number
          company_name: string
          contact_id: number
          department: string
          email: string
          first_name: string
          industry: string
          job_level: string
          last_name: string
          phone: string
          state: string
          total_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
