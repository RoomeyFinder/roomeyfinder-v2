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
      amenities: {
        Row: {
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      home_addresses: {
        Row: {
          created_at: string
          home_id: string
          location: unknown
          postal_code: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          home_id: string
          location?: unknown
          postal_code?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          home_id?: string
          location?: unknown
          postal_code?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_addresses_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: true
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
        ]
      }
      home_amenities: {
        Row: {
          amenity_id: string
          home_id: string
        }
        Insert: {
          amenity_id: string
          home_id: string
        }
        Update: {
          amenity_id?: string
          home_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_amenities_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
        ]
      }
      home_photos: {
        Row: {
          created_at: string | null
          home_id: string
          id: string
          is_primary: boolean
          position: number
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          home_id: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path: string
        }
        Update: {
          created_at?: string | null
          home_id?: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_photos_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
        ]
      }
      homes: {
        Row: {
          available_from: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          country: string | null
          created_at: string | null
          deposit: number | null
          description: string | null
          id: string
          owner_id: string
          rent: number | null
          state: string | null
          status: Database["public"]["Enums"]["home_status"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          id?: string
          owner_id: string
          rent?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["home_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          id?: string
          owner_id?: string
          rent?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["home_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string | null
          from_profile_id: string
          id: string
          status: Database["public"]["Enums"]["interest_status"] | null
          to_profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_profile_id: string
          id?: string
          status?: Database["public"]["Enums"]["interest_status"] | null
          to_profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_profile_id?: string
          id?: string
          status?: Database["public"]["Enums"]["interest_status"] | null
          to_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interests_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          match_with_home_seekers: boolean
          max_age: number | null
          max_distance_miles: number | null
          min_age: number | null
          move_in_from: string | null
          move_in_to: string | null
          pets_preference: Database["public"]["Enums"]["pets_type"] | null
          preferred_gender: Database["public"]["Enums"]["gender_type"] | null
          smoking_preference: Database["public"]["Enums"]["smoking_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          match_with_home_seekers?: boolean
          max_age?: number | null
          max_distance_miles?: number | null
          min_age?: number | null
          move_in_from?: string | null
          move_in_to?: string | null
          pets_preference?: Database["public"]["Enums"]["pets_type"] | null
          preferred_gender?: Database["public"]["Enums"]["gender_type"] | null
          smoking_preference?:
            | Database["public"]["Enums"]["smoking_type"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          match_with_home_seekers?: boolean
          max_age?: number | null
          max_distance_miles?: number | null
          min_age?: number | null
          move_in_from?: string | null
          move_in_to?: string | null
          pets_preference?: Database["public"]["Enums"]["pets_type"] | null
          preferred_gender?: Database["public"]["Enums"]["gender_type"] | null
          smoking_preference?:
            | Database["public"]["Enums"]["smoking_type"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_contacts: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean
          position: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_private: {
        Row: {
          created_at: string
          date_of_birth: string | null
          last_name: string | null
          location: unknown
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          last_name?: string | null
          location?: unknown
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          last_name?: string | null
          location?: unknown
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_private_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_verified: boolean | null
          is_visible: boolean | null
          occupation: string | null
          profile_status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          occupation?: string | null
          profile_status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          occupation?: string | null
          profile_status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_matches: {
        Args: { requesting_profile_id: string; result_limit: number; result_offset: number }
        Returns: {
          age_in_range: boolean
          budget_overlap: boolean
          budget_overlap_max: number
          budget_overlap_min: number
          candidate_age: number
          compatibility_percentage: number
          distance_miles: number
          distance_within_range: boolean
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          home_available_from: string
          home_bathrooms: number
          home_bedrooms: number
          home_city: string
          home_id: string
          home_rent: number
          home_state: string
          home_title: string
          is_fallback: boolean
          move_in_overlap_from: string
          move_in_overlap_to: string
          move_in_window_overlap: boolean
          pets_preference_match: boolean
          preferred_gender_match: boolean
          profile_id: string
          smoking_preference_match: boolean
          username: string
        }[]
      }
    }
    Enums: {
      gender_type: "male" | "female" | "non_binary" | "prefer_not_to_say"
      home_status: "draft" | "active" | "archived"
      intent_type: "need_home" | "have_home"
      interest_status: "pending" | "accepted" | "declined"
      pets_type: "yes" | "no" | "depends"
      smoking_type: "yes" | "no" | "outside_only"
      user_status: "active" | "archived"
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
      gender_type: ["male", "female", "non_binary", "prefer_not_to_say"],
      home_status: ["draft", "active", "archived"],
      intent_type: ["need_home", "have_home"],
      interest_status: ["pending", "accepted", "declined"],
      pets_type: ["yes", "no", "depends"],
      smoking_type: ["yes", "no", "outside_only"],
      user_status: ["active", "archived"],
    },
  },
} as const
