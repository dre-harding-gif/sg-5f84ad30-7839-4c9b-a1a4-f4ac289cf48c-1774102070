 
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
      company_bills: {
        Row: {
          amount: number
          bill_name: string
          category: string
          created_at: string | null
          due_date: string | null
          frequency: string
          id: string
          last_paid: string | null
          notes: string | null
          provider: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_name: string
          category: string
          created_at?: string | null
          due_date?: string | null
          frequency: string
          id?: string
          last_paid?: string | null
          notes?: string | null
          provider: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_name?: string
          category?: string
          created_at?: string | null
          due_date?: string | null
          frequency?: string
          id?: string
          last_paid?: string | null
          notes?: string | null
          provider?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_fleet: {
        Row: {
          assigned_driver: string | null
          created_at: string | null
          id: string
          insurance_expiry: string
          make: string
          mileage: number | null
          model: string
          mot_expiry: string
          notes: string | null
          registration: string
          updated_at: string | null
          year: number
        }
        Insert: {
          assigned_driver?: string | null
          created_at?: string | null
          id?: string
          insurance_expiry: string
          make: string
          mileage?: number | null
          model: string
          mot_expiry: string
          notes?: string | null
          registration: string
          updated_at?: string | null
          year: number
        }
        Update: {
          assigned_driver?: string | null
          created_at?: string | null
          id?: string
          insurance_expiry?: string
          make?: string
          mileage?: number | null
          model?: string
          mot_expiry?: string
          notes?: string | null
          registration?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          annual_premium: number
          coverage_amount: number | null
          created_at: string | null
          id: string
          notes: string | null
          policy_number: string
          policy_type: string
          provider: string
          renewal_date: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          annual_premium: number
          coverage_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          policy_number: string
          policy_type: string
          provider: string
          renewal_date: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_premium?: number
          coverage_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          policy_number?: string
          policy_type?: string
          provider?: string
          renewal_date?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          current_quantity: number | null
          id: string
          item_type: string
          location: string | null
          name: string
          notes: string | null
          reorder_level: number | null
          supplier: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          item_type: string
          location?: string | null
          name: string
          notes?: string | null
          reorder_level?: number | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          item_type?: string
          location?: string | null
          name?: string
          notes?: string | null
          reorder_level?: number | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          job_id: string | null
          notes: string | null
          quantity: number
          transaction_date: string | null
          transaction_type: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          job_id?: string | null
          notes?: string | null
          quantity: number
          transaction_date?: string | null
          transaction_type: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          job_id?: string | null
          notes?: string | null
          quantity?: number
          transaction_date?: string | null
          transaction_type?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_guide: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          estimated_duration: string | null
          id: string
          notes: string | null
          price_max: number | null
          price_min: number | null
          service_name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          price_max?: number | null
          price_min?: number | null
          service_name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          price_max?: number | null
          price_min?: number | null
          service_name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
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
