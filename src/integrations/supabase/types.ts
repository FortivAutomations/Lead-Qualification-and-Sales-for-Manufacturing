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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appoinment_detials: {
        Row: {
          date: string | null
          end_time: string | null
          id: string
          lead_id: string | null
          start_time: string | null
        }
        Insert: {
          date?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          start_time?: string | null
        }
        Update: {
          date?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appoinment_detials_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "incoming_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_details: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          date: string | null
          end_time: string | null
          id: string
          lead_email: string | null
          lead_id: string | null
          lead_name: string | null
          start_time: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          lead_email?: string | null
          lead_id?: string | null
          lead_name?: string | null
          start_time?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          lead_email?: string | null
          lead_id?: string | null
          lead_name?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      call_logs_activity: {
        Row: {
          assigned_sales_rep: string | null
          call_duration: number | null
          call_recording_url: string | null
          call_status: string | null
          call_summary: string | null
          call_timestamp: string | null
          call_type: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          next_action_required: string | null
          next_contact_date: string | null
          sentiment_score: string | null
          sr_no: number | null
        }
        Insert: {
          assigned_sales_rep?: string | null
          call_duration?: number | null
          call_recording_url?: string | null
          call_status?: string | null
          call_summary?: string | null
          call_timestamp?: string | null
          call_type?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          next_action_required?: string | null
          next_contact_date?: string | null
          sentiment_score?: string | null
          sr_no?: number | null
        }
        Update: {
          assigned_sales_rep?: string | null
          call_duration?: number | null
          call_recording_url?: string | null
          call_status?: string | null
          call_summary?: string | null
          call_timestamp?: string | null
          call_type?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          next_action_required?: string | null
          next_contact_date?: string | null
          sentiment_score?: string | null
          sr_no?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_activity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "incoming_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up: {
        Row: {
          created_at: string
          followup_type: string | null
          id: string
          lead_id: string | null
          scheduled_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "incoming_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_leads: {
        Row: {
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          email_address: string | null
          id: string
          industry_sector: string | null
          initial_interest_notes: string | null
          lead_source: string | null
          phone_number: string | null
          sr_no: number | null
          status: string | null
          time_stamp: string | null
          vapi_call_id: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email_address?: string | null
          id?: string
          industry_sector?: string | null
          initial_interest_notes?: string | null
          lead_source?: string | null
          phone_number?: string | null
          sr_no?: number | null
          status?: string | null
          time_stamp?: string | null
          vapi_call_id?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email_address?: string | null
          id?: string
          industry_sector?: string | null
          initial_interest_notes?: string | null
          lead_source?: string | null
          phone_number?: string | null
          sr_no?: number | null
          status?: string | null
          time_stamp?: string | null
          vapi_call_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      qualification_data: {
        Row: {
          authority_level: string | null
          budget_range: string | null
          created_at: string | null
          current_supplier: string | null
          decision_maker: boolean | null
          delivery_timeline: string | null
          id: string
          lead_id: string | null
          lead_type: string | null
          material_specifications: string | null
          moq_requirements: string | null
          pain_points_identified: string | null
          production_volume_requirements: string | null
          qualification_score: number | null
          qualification_status: string | null
          required_certifications: string | null
          sr_no: number | null
          technical_requirements: string | null
        }
        Insert: {
          authority_level?: string | null
          budget_range?: string | null
          created_at?: string | null
          current_supplier?: string | null
          decision_maker?: boolean | null
          delivery_timeline?: string | null
          id?: string
          lead_id?: string | null
          lead_type?: string | null
          material_specifications?: string | null
          moq_requirements?: string | null
          pain_points_identified?: string | null
          production_volume_requirements?: string | null
          qualification_score?: number | null
          qualification_status?: string | null
          required_certifications?: string | null
          sr_no?: number | null
          technical_requirements?: string | null
        }
        Update: {
          authority_level?: string | null
          budget_range?: string | null
          created_at?: string | null
          current_supplier?: string | null
          decision_maker?: boolean | null
          delivery_timeline?: string | null
          id?: string
          lead_id?: string | null
          lead_type?: string | null
          material_specifications?: string | null
          moq_requirements?: string | null
          pain_points_identified?: string | null
          production_volume_requirements?: string | null
          qualification_score?: number | null
          qualification_status?: string | null
          required_certifications?: string | null
          sr_no?: number | null
          technical_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualification_data_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "incoming_leads"
            referencedColumns: ["id"]
          },
        ]
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
