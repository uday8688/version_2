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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          priority: string
          property_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          priority?: string
          property_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          priority?: string
          property_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      background_verifications: {
        Row: {
          api_response: Json | null
          created_at: string
          document_number: string
          document_url: string | null
          expiry_date: string | null
          id: string
          updated_at: string
          user_id: string
          verification_status: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          api_response?: Json | null
          created_at?: string
          document_number: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          updated_at?: string
          user_id: string
          verification_status?: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          api_response?: Json | null
          created_at?: string
          document_number?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      community_events: {
        Row: {
          created_at: string
          created_by: string
          current_participants: number | null
          description: string
          end_time: string
          event_date: string
          event_type: string
          id: string
          is_active: boolean | null
          location: string
          max_participants: number | null
          property_id: string
          registration_required: boolean | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_participants?: number | null
          description: string
          end_time: string
          event_date: string
          event_type: string
          id?: string
          is_active?: boolean | null
          location: string
          max_participants?: number | null
          property_id: string
          registration_required?: boolean | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_participants?: number | null
          description?: string
          end_time?: string
          event_date?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          location?: string
          max_participants?: number | null
          property_id?: string
          registration_required?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          likes_count: number | null
          post_type: string
          property_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          likes_count?: number | null
          post_type?: string
          property_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          likes_count?: number | null
          post_type?: string
          property_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_registrations_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          end_date: string
          id: string
          monthly_rent: number
          security_deposit: number | null
          start_date: string
          status: string
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          monthly_rent: number
          security_deposit?: number | null
          start_date: string
          status?: string
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          monthly_rent?: number
          security_deposit?: number | null
          start_date?: string
          status?: string
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          id: string
          priority: string
          status: string
          tenant_id: string
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          id?: string
          priority?: string
          status?: string
          tenant_id: string
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          id?: string
          priority?: string
          status?: string
          tenant_id?: string
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          community_announcements: boolean | null
          created_at: string
          email_enabled: boolean | null
          id: string
          maintenance_updates: boolean | null
          payment_reminders: boolean | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string | null
          visitor_requests: boolean | null
        }
        Insert: {
          community_announcements?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          maintenance_updates?: boolean | null
          payment_reminders?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
          visitor_requests?: boolean | null
        }
        Update: {
          community_announcements?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          maintenance_updates?: boolean | null
          payment_reminders?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
          visitor_requests?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          lease_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_type: string
          status: string
          stripe_payment_id: string | null
          transaction_fee: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          lease_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_type?: string
          status?: string
          stripe_payment_id?: string | null
          transaction_fee?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          lease_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_type?: string
          status?: string
          stripe_payment_id?: string | null
          transaction_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_comments_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          name: string
          owner_id: string
          state: string
          total_units: number
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          name: string
          owner_id: string
          state: string
          total_units?: number
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          state?: string
          total_units?: number
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_jobs: {
        Row: {
          completion_photos: string[] | null
          created_at: string
          id: string
          invoice_amount: number | null
          maintenance_request_id: string
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completion_photos?: string[] | null
          created_at?: string
          id?: string
          invoice_amount?: number | null
          maintenance_request_id: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          completion_photos?: string[] | null
          created_at?: string
          id?: string
          invoice_amount?: number | null
          maintenance_request_id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_jobs_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_jobs_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number
          bedrooms: number
          created_at: string
          id: string
          is_occupied: boolean
          property_id: string
          rent_amount: number
          square_feet: number | null
          unit_number: string
          updated_at: string
        }
        Insert: {
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          id?: string
          is_occupied?: boolean
          property_id: string
          rent_amount: number
          square_feet?: number | null
          unit_number: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          id?: string
          is_occupied?: boolean
          property_id?: string
          rent_amount?: number
          square_feet?: number | null
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_bills: {
        Row: {
          amount: number
          bill_type: string
          billing_period_end: string
          billing_period_start: string
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          property_id: string | null
          status: string
          stripe_payment_id: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bill_type: string
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          property_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_type?: string
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          property_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_bills_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_bills_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_requests: {
        Row: {
          approval_time: string | null
          approved_by: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          id: string
          notes: string | null
          purpose: string
          status: string
          tenant_id: string
          updated_at: string
          visit_date: string
          visit_time: string
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string
        }
        Insert: {
          approval_time?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purpose: string
          status?: string
          tenant_id: string
          updated_at?: string
          visit_date: string
          visit_time: string
          visitor_email?: string | null
          visitor_name: string
          visitor_phone: string
        }
        Update: {
          approval_time?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purpose?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          visit_date?: string
          visit_time?: string
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "tenant" | "vendor"
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
      app_role: ["admin", "owner", "tenant", "vendor"],
    },
  },
} as const
