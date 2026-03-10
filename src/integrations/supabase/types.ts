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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: string
          location: string
          severity: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: string
          location: string
          severity: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          location?: string
          severity?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      broadcast_notifications: {
        Row: {
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      campaign_chat_messages: {
        Row: {
          campaign_id: string
          created_at: string
          deleted_by: string | null
          id: string
          is_deleted: boolean
          message: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          message: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_chat_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          campaign_id: string
          id: string
          joined_at: string
          notifications_enabled: boolean | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          joined_at?: string
          notifications_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_updates: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          goal: string
          id: string
          image_url: string | null
          images: string[] | null
          status: string | null
          supporters: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          goal: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          status?: string | null
          supporters?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          goal?: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          status?: string | null
          supporters?: number | null
          title?: string
        }
        Relationships: []
      }
      climate_products: {
        Row: {
          category: string
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          location: string | null
          price: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          price: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disaster_alerts: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string
          precautions: string[] | null
          probability: number | null
          severity: string
          timeframe: string | null
          title: string
          type: string
          updated_at: string | null
          weather_data: Json | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          precautions?: string[] | null
          probability?: number | null
          severity: string
          timeframe?: string | null
          title: string
          type: string
          updated_at?: string | null
          weather_data?: Json | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          precautions?: string[] | null
          probability?: number | null
          severity?: string
          timeframe?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          weather_data?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin: boolean | null
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          admin?: boolean | null
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          admin?: boolean | null
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      report_comments: {
        Row: {
          author: string | null
          created_at: string | null
          id: string
          report_id: string | null
          text: string
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          id?: string
          report_id?: string | null
          text: string
        }
        Update: {
          author?: string | null
          created_at?: string | null
          id?: string
          report_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          images: string[] | null
          issue_type: string
          likes: number | null
          location: string
          status: string | null
          title: string
          upvotes: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          images?: string[] | null
          issue_type: string
          likes?: number | null
          location: string
          status?: string | null
          title: string
          upvotes?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          images?: string[] | null
          issue_type?: string
          likes?: number | null
          location?: string
          status?: string | null
          title?: string
          upvotes?: number | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          alert_radius_km: number | null
          created_at: string | null
          disaster_alerts: boolean | null
          email_notifications: boolean | null
          humidity_threshold: number | null
          id: string
          push_notifications: boolean | null
          rain_threshold: number | null
          sms_alerts: boolean | null
          temp_high_threshold: number | null
          temp_low_threshold: number | null
          updated_at: string | null
          user_id: string
          weather_alerts: boolean | null
          wind_threshold: number | null
        }
        Insert: {
          alert_radius_km?: number | null
          created_at?: string | null
          disaster_alerts?: boolean | null
          email_notifications?: boolean | null
          humidity_threshold?: number | null
          id?: string
          push_notifications?: boolean | null
          rain_threshold?: number | null
          sms_alerts?: boolean | null
          temp_high_threshold?: number | null
          temp_low_threshold?: number | null
          updated_at?: string | null
          user_id: string
          weather_alerts?: boolean | null
          wind_threshold?: number | null
        }
        Update: {
          alert_radius_km?: number | null
          created_at?: string | null
          disaster_alerts?: boolean | null
          email_notifications?: boolean | null
          humidity_threshold?: number | null
          id?: string
          push_notifications?: boolean | null
          rain_threshold?: number | null
          sms_alerts?: boolean | null
          temp_high_threshold?: number | null
          temp_low_threshold?: number | null
          updated_at?: string | null
          user_id?: string
          weather_alerts?: boolean | null
          wind_threshold?: number | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
