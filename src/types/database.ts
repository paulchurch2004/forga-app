// Supabase Database types — generated from schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          sex: 'male' | 'female' | null;
          age: number | null;
          height_cm: number | null;
          current_weight: number | null;
          target_weight: number | null;
          target_deadline: string | null;
          objective: 'bulk' | 'cut' | 'maintain' | 'recomp' | null;
          activity_level: string | null;
          budget: string;
          restrictions: string[];
          tdee: number | null;
          daily_calories: number | null;
          daily_protein: number | null;
          daily_carbs: number | null;
          daily_fat: number | null;
          meals_per_day: number | null;
          current_streak: number;
          best_streak: number;
          streak_freeze_used_this_week: boolean;
          forga_score: number;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          sex?: 'male' | 'female' | null;
          age?: number | null;
          height_cm?: number | null;
          current_weight?: number | null;
          target_weight?: number | null;
          target_deadline?: string | null;
          objective?: 'bulk' | 'cut' | 'maintain' | 'recomp' | null;
          activity_level?: string | null;
          budget?: string;
          restrictions?: string[];
          tdee?: number | null;
          daily_calories?: number | null;
          daily_protein?: number | null;
          daily_carbs?: number | null;
          daily_fat?: number | null;
          meals_per_day?: number | null;
          current_streak?: number;
          best_streak?: number;
          streak_freeze_used_this_week?: boolean;
          forga_score?: number;
          is_premium?: boolean;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      daily_meals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          slot: string;
          meal_id: string;
          adjusted_quantities: Json;
          actual_macros: Json;
          validated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          slot: string;
          meal_id: string;
          adjusted_quantities?: Json;
          actual_macros?: Json;
        };
        Update: Partial<Database['public']['Tables']['daily_meals']['Insert']>;
      };
      weekly_checkins: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          weight: number | null;
          energy: number | null;
          hunger: number | null;
          performance: number | null;
          sleep: number | null;
          calorie_adjustment: number;
          adjustment_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          weight?: number | null;
          energy?: number | null;
          hunger?: number | null;
          performance?: number | null;
          sleep?: number | null;
          calorie_adjustment?: number;
          adjustment_reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['weekly_checkins']['Insert']>;
      };
      weight_log: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          weight: number;
        };
        Update: Partial<Database['public']['Tables']['weight_log']['Insert']>;
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
        };
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          meal_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_id: string;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
      score_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total: number | null;
          nutrition: number | null;
          consistency: number | null;
          progression: number | null;
          discipline: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total?: number | null;
          nutrition?: number | null;
          consistency?: number | null;
          progression?: number | null;
          discipline?: number | null;
        };
        Update: Partial<Database['public']['Tables']['score_history']['Insert']>;
      };
    };
  };
}
