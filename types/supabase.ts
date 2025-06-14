export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      adapt_plan_calls: {
        Row: {
          api_response: Json | null
          called_at: string
          error_message: string | null
          help_me_catch_up: boolean
          id: string
          input_json: Json
          prompt_version: string | null
          status: string | null
          updated_runs: Json | null
          user_id: string
          week_id: string
        }
        Insert: {
          api_response?: Json | null
          called_at?: string
          error_message?: string | null
          help_me_catch_up?: boolean
          id?: string
          input_json: Json
          prompt_version?: string | null
          status?: string | null
          updated_runs?: Json | null
          user_id: string
          week_id: string
        }
        Update: {
          api_response?: Json | null
          called_at?: string
          error_message?: string | null
          help_me_catch_up?: boolean
          id?: string
          input_json?: Json
          prompt_version?: string | null
          status?: string | null
          updated_runs?: Json | null
          user_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adapt_plan_calls_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adapt_plan_calls_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      pace_zones: {
        Row: {
          created_at: string | null
          goal_pace: string | null
          id: string
          interval_max: string | null
          interval_min: string | null
          repetition_max: string | null
          repetition_min: string | null
          tempo_max: string | null
          tempo_min: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_pace?: string | null
          id?: string
          interval_max?: string | null
          interval_min?: string | null
          repetition_max?: string | null
          repetition_min?: string | null
          tempo_max?: string | null
          tempo_min?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_pace?: string | null
          id?: string
          interval_max?: string | null
          interval_min?: string | null
          repetition_max?: string | null
          repetition_min?: string | null
          tempo_max?: string | null
          tempo_min?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pace_zones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sessions: {
        Row: {
          day: string
          description: Json | null
          focus: string | null
          id: string
          last_updated_by_ai: boolean | null
          order_in_day: number | null
          type: string
          updated_at: string | null
          week_id: string | null
        }
        Insert: {
          day: string
          description?: Json | null
          focus?: string | null
          id?: string
          last_updated_by_ai?: boolean | null
          order_in_day?: number | null
          type: string
          updated_at?: string | null
          week_id?: string | null
        }
        Update: {
          day?: string
          description?: Json | null
          focus?: string | null
          id?: string
          last_updated_by_ai?: boolean | null
          order_in_day?: number | null
          type?: string
          updated_at?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_week"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sessions_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_weeks: {
        Row: {
          fatigue: number | null
          id: string
          plan_id: string | null
          week_number: number
          weekly_distance: number | null
          weekly_tips: Json | null
        }
        Insert: {
          fatigue?: number | null
          id?: string
          plan_id?: string | null
          week_number: number
          weekly_distance?: number | null
          weekly_tips?: Json | null
        }
        Update: {
          fatigue?: number | null
          id?: string
          plan_id?: string | null
          week_number?: number
          weekly_distance?: number | null
          weekly_tips?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          height: number | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          height?: number | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          height?: number | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      strava_profiles: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: number | null
          id: string
          refresh_token: string | null
          strava_athlete_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: number | null
          id?: string
          refresh_token?: string | null
          strava_athlete_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: number | null
          id?: string
          refresh_token?: string | null
          strava_athlete_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strava_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          block_number: number
          end_date: string
          generated_at: string
          id: string
          inputs_json: Json | null
          plan_data: Json
          plan_summary: Json | null
          start_date: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          block_number: number
          end_date: string
          generated_at?: string
          id?: string
          inputs_json?: Json | null
          plan_data: Json
          plan_summary?: Json | null
          start_date: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          block_number?: number
          end_date?: string
          generated_at?: string
          id?: string
          inputs_json?: Json | null
          plan_data?: Json
          plan_summary?: Json | null
          start_date?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          avg_heart_rate: number | null
          created_at: string | null
          date: string
          distance: number | null
          elapsed_time: number | null
          id: string
          max_heart_rate: number | null
          notes: string | null
          rpe: number | null
          session_id: string | null
          skipped: boolean | null
          user_id: string | null
        }
        Insert: {
          avg_heart_rate?: number | null
          created_at?: string | null
          date: string
          distance?: number | null
          elapsed_time?: number | null
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          rpe?: number | null
          session_id?: string | null
          skipped?: boolean | null
          user_id?: string | null
        }
        Update: {
          avg_heart_rate?: number | null
          created_at?: string | null
          date?: string
          distance?: number | null
          elapsed_time?: number | null
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          rpe?: number | null
          session_id?: string | null
          skipped?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "plan_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
