 
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
      customer_portal_access: {
        Row: {
          access_code: string
          created_at: string | null
          customer_id: string
          id: string
          is_active: boolean | null
          job_id: string
          last_accessed: string | null
        }
        Insert: {
          access_code: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_active?: boolean | null
          job_id: string
          last_accessed?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_active?: boolean | null
          job_id?: string
          last_accessed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
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
          assigned_to: string | null
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
          assigned_to?: string | null
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
          assigned_to?: string | null
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
      invoices: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          job_id: string | null
          paid_date: string | null
          payment_method: string | null
          payment_status: string | null
          quote_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          job_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quote_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          job_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quote_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          id: string
          job_id: string
          photo_type: string
          photo_url: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          id?: string
          job_id: string
          photo_type: string
          photo_url: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          id?: string
          job_id?: string
          photo_type?: string
          photo_url?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_hours: number | null
          address: string
          assigned_team: string[] | null
          completed_at: string | null
          created_at: string | null
          customer_id: string
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          final_price: number | null
          id: string
          job_number: string
          latitude: number | null
          longitude: number | null
          materials_needed: string | null
          notes: string | null
          postcode: string | null
          priority: string | null
          quoted_price: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          address: string
          assigned_team?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          final_price?: number | null
          id?: string
          job_number: string
          latitude?: number | null
          longitude?: number | null
          materials_needed?: string | null
          notes?: string | null
          postcode?: string | null
          priority?: string | null
          quoted_price?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          address?: string
          assigned_team?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          final_price?: number | null
          id?: string
          job_number?: string
          latitude?: number | null
          longitude?: number | null
          materials_needed?: string | null
          notes?: string | null
          postcode?: string | null
          priority?: string | null
          quoted_price?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          budget_range: string | null
          converted_to_customer_id: string | null
          created_at: string | null
          customer_name: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          message: string | null
          notes: string | null
          phone: string
          postcode: string | null
          service_requested: string
          source: string
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          converted_to_customer_id?: string | null
          created_at?: string | null
          customer_name: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          notes?: string | null
          phone: string
          postcode?: string | null
          service_requested: string
          source?: string
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          converted_to_customer_id?: string | null
          created_at?: string | null
          customer_name?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          notes?: string | null
          phone?: string
          postcode?: string | null
          service_requested?: string
          source?: string
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_customer_id_fkey"
            columns: ["converted_to_customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_customer_id_fkey"
            columns: ["converted_to_customer_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          job_id: string | null
          message: string
          recipient: string
          sent_at: string | null
          status: string | null
          subject: string | null
          trigger_event: string
          type: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          message: string
          recipient: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          trigger_event: string
          type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          message?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          trigger_event?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
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
          permissions: Json | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_date: string | null
          id: string
          items: Json | null
          job_id: string | null
          notes: string | null
          order_date: string | null
          po_number: string
          status: string | null
          supplier: string
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          items?: Json | null
          job_id?: string | null
          notes?: string | null
          order_date?: string | null
          po_number: string
          status?: string | null
          supplier: string
          total_amount: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          items?: Json | null
          job_id?: string | null
          notes?: string | null
          order_date?: string | null
          po_number?: string
          status?: string | null
          supplier?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          job_id: string | null
          line_items: Json
          notes: string | null
          quote_number: string
          status: string | null
          subtotal: number
          total: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          quote_number: string
          status?: string | null
          subtotal?: number
          total: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          created_at: string | null
          hours_worked: number
          id: string
          job_id: string
          log_date: string
          user_id: string
          work_description: string | null
        }
        Insert: {
          created_at?: string | null
          hours_worked: number
          id?: string
          job_id: string
          log_date?: string
          user_id: string
          work_description?: string | null
        }
        Update: {
          created_at?: string | null
          hours_worked?: number
          id?: string
          job_id?: string
          log_date?: string
          user_id?: string
          work_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_permissions: {
        Row: {
          email: string | null
          full_name: string | null
          id: string | null
          permissions: Json | null
          role: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id?: string | null
          permissions?: never
          role?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string | null
          permissions?: never
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_po_number: { Args: never; Returns: string }
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
