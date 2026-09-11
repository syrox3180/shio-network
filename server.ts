import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "./env";

// Env anahtarlari girilmemisse null doner; site demo veriyle calisir.
export async function createClient() {
  if (!hasSupabase) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component icinden cagrildi; middleware oturumu zaten yeniliyor.
        }
      },
    },
  });
}
