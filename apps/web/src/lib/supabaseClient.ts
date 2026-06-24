import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; created_at: string; updated_at: string };
        Insert: { id: string; display_name: string; created_at?: string; updated_at?: string };
        Update: { display_name?: string; updated_at?: string };
        Relationships: [];
      };
      cube_scans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: "VALID" | "INVALID" | "SOLVED";
          scan: Json;
          solution: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          status?: "VALID" | "INVALID" | "SOLVED";
          scan: Json;
          solution?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          status?: "VALID" | "INVALID" | "SOLVED";
          scan?: Json;
          solution?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      solve_history: {
        Row: {
          id: string;
          user_id: string;
          scan_id: string | null;
          solution: Json;
          duration_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scan_id?: string | null;
          solution: Json;
          duration_ms: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      leaderboard_entries: {
        Row: { id: string; user_id: string; best_time_ms: number; solves: number; created_at: string; updated_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { scan_status: "VALID" | "INVALID" | "SOLVED" };
    CompositeTypes: Record<string, never>;
  };
};

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return client;
}
