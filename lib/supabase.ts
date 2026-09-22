import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Mismo proyecto de Supabase que el Screener DCF, schema propio ("taller")
// para no chocar con "dcf_tracker".
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  { db: { schema: "taller" } }
);

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  stack: string[];
  status: string;
  for_sale: boolean;
  price: string | null;
  screenshot: string | null;
  video_url: string | null;
  sort_order: number;
  updated_at: string;
}

export const paypalLink = "https://paypal.me/truquo";
export const contactEmail = "lacomunidadinversora@gmail.com";
