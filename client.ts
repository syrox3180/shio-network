"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "./env";

export function createClient() {
  if (!hasSupabase) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
