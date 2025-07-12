export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          city_id: number
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
      contact_master: {
        Row: {
          company_id: number | null
          contact_id: number
          department: string | null
          designation: string | null
          direct_phone_number: string | null
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
          company_id?: number | null
          contact_id: number
          department?: string | null
          designation?: string | null
          direct_phone_number?: string | null
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
          company_id?: number | null
          contact_id?: number
          department?: string | null
          designation?: string | null
          direct_phone_number?: string | null
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
            foreignKeyName: "contact_master_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "organisation_master"
            referencedColumns: ["company_id"]
          },
        ]
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
      organisation_master: {
        Row: {
          annual_revenue: number | null
          company_id: number
          company_name: string | null
          employees: number | null
          headquarters: string | null
          industry: string | null
        }
        Insert: {
          annual_revenue?: number | null
          company_id?: never
          company_name?: string | null
          employees?: number | null
          headquarters?: string | null
          industry?: string | null
        }
        Update: {
          annual_revenue?: number | null
          company_id?: never
          company_name?: string | null
          employees?: number | null
          headquarters?: string | null
          industry?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
