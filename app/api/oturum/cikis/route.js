import { cookies } from "next/headers";
import { oturumuSil, ERISIM_CEREZ } from "../../../../lib/oturum-sunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    const token = cookies().get(ERISIM_CEREZ)?.value;
    const { tumCihazlar } = await request.json().catch(() => ({}));

    // Supabase tarafindaki oturumu da kapat
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=${tumCihazlar ? "global" : "local"}`, {
        method: "POST",
        cache: "no-store",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  } finally {
    oturumuSil();
  }

  return Response.json({ tamam: true });
}
