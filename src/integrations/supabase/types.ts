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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          target_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      joinings: {
        Row: {
          address: string | null
          bio_id: string | null
          college: string | null
          created_at: string
          date: string | null
          department: string | null
          emp_id: string | null
          id: string
          job_type: string | null
          joining_status: string | null
          name: string
          onb_complete: boolean | null
          onboarding: Json | null
          position: string | null
          qualification: string | null
          referred_by: string | null
          remarks: string | null
          updated_at: string
          vacancy_id: string | null
        }
        Insert: {
          address?: string | null
          bio_id?: string | null
          college?: string | null
          created_at?: string
          date?: string | null
          department?: string | null
          emp_id?: string | null
          id?: string
          job_type?: string | null
          joining_status?: string | null
          name: string
          onb_complete?: boolean | null
          onboarding?: Json | null
          position?: string | null
          qualification?: string | null
          referred_by?: string | null
          remarks?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Update: {
          address?: string | null
          bio_id?: string | null
          college?: string | null
          created_at?: string
          date?: string | null
          department?: string | null
          emp_id?: string | null
          id?: string
          job_type?: string | null
          joining_status?: string | null
          name?: string
          onb_complete?: boolean | null
          onboarding?: Json | null
          position?: string | null
          qualification?: string | null
          referred_by?: string | null
          remarks?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          pin: string
          short_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          pin?: string
          short_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          pin?: string
          short_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      requisitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          block: string | null
          count: number
          created_at: string
          department: string
          hod_name: string
          id: string
          job_type: string | null
          justification: string | null
          position: string
          req_id: string
          status: string
          sub_category: string | null
          vacancy_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          block?: string | null
          count?: number
          created_at?: string
          department: string
          hod_name: string
          id?: string
          job_type?: string | null
          justification?: string | null
          position: string
          req_id: string
          status?: string
          sub_category?: string | null
          vacancy_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          block?: string | null
          count?: number
          created_at?: string
          department?: string
          hod_name?: string
          id?: string
          job_type?: string | null
          justification?: string | null
          position?: string
          req_id?: string
          status?: string
          sub_category?: string | null
          vacancy_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          ad_date: string | null
          ad_platform: string | null
          applied: number | null
          block: string | null
          created_at: string
          department: string
          filled_count: number
          grade: string | null
          id: string
          interviewed: number | null
          job_type: string
          location: string | null
          offer_accepted: number | null
          offer_declined: number | null
          offer_made: number | null
          position: string
          remarks: string | null
          requestor: string | null
          required_count: number
          selected: number | null
          shortlisted: number | null
          source: string | null
          status: string
          sub_category: string
          updated_at: string | null
          updated_by: string | null
          vacancy_id: string
        }
        Insert: {
          ad_date?: string | null
          ad_platform?: string | null
          applied?: number | null
          block?: string | null
          created_at?: string
          department: string
          filled_count?: number
          grade?: string | null
          id?: string
          interviewed?: number | null
          job_type?: string
          location?: string | null
          offer_accepted?: number | null
          offer_declined?: number | null
          offer_made?: number | null
          position: string
          remarks?: string | null
          requestor?: string | null
          required_count?: number
          selected?: number | null
          shortlisted?: number | null
          source?: string | null
          status?: string
          sub_category?: string
          updated_at?: string | null
          updated_by?: string | null
          vacancy_id: string
        }
        Update: {
          ad_date?: string | null
          ad_platform?: string | null
          applied?: number | null
          block?: string | null
          created_at?: string
          department?: string
          filled_count?: number
          grade?: string | null
          id?: string
          interviewed?: number | null
          job_type?: string
          location?: string | null
          offer_accepted?: number | null
          offer_declined?: number | null
          offer_made?: number | null
          position?: string
          remarks?: string | null
          requestor?: string | null
          required_count?: number
          selected?: number | null
          shortlisted?: number | null
          source?: string | null
          status?: string
          sub_category?: string
          updated_at?: string | null
          updated_by?: string | null
          vacancy_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr_team" | "view_only"
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
      app_role: ["admin", "hr_team", "view_only"],
    },
  },
} as const
