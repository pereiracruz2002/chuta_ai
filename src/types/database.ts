export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      pools: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          invite_code?: string;
          created_at?: string;
        };
      };
      pool_members: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          score: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          score?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          score?: number;
          joined_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          home_team: string;
          away_team: string;
          starts_at: string;
          stage: string;
          home_score: number | null;
          away_score: number | null;
          finished: boolean;
        };
        Insert: {
          id?: string;
          home_team: string;
          away_team: string;
          starts_at: string;
          stage: string;
          home_score?: number | null;
          away_score?: number | null;
          finished?: boolean;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          starts_at?: string;
          stage?: string;
          home_score?: number | null;
          away_score?: number | null;
          finished?: boolean;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          pool_id: string;
          match_id: string;
          home_prediction: number;
          away_prediction: number;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pool_id: string;
          match_id: string;
          home_prediction: number;
          away_prediction: number;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pool_id?: string;
          match_id?: string;
          home_prediction?: number;
          away_prediction?: number;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
