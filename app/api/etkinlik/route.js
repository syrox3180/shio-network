export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/* Etkinlik bilgisi herkese açık — giriş yapmamış oyuncu da görebilsin */
export async function GET() {
  if (!SUPABASE_URL || !ANON_KEY) return Response.json({ aktif: false });

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_ayarlari?select=deger&anahtar=eq.kredi_carpani`,
      { cache: "no-store", headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );

    if (!res.ok) return Response.json({ aktif: false });

    const liste = await res.json();
    const deger = liste?.[0]?.deger || {};
    const suresiDoldu = deger.bitis && new Date(deger.bitis) < new Date();

    return Response.json({
      aktif: Boolean(deger.aktif) && !suresiDoldu,
      carpan: Number(deger.carpan || 1),
      bitis: deger.bitis || null,
      baslik: deger.baslik || "KREDİ ETKİNLİĞİ",
    });
  } catch {
    return Response.json({ aktif: false });
  }
}
