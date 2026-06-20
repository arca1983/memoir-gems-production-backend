import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cpqesgztpjjefkveitsm.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  size: string;
  image_url?: string;
  photos_per_set?: number;
  is_active?: boolean;
};
