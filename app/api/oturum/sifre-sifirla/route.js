import { hizSiniri, istekIp } from "../../../../lib/oturum-sunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    const ip = istekIp(request);
    const sinir = hizSiniri(`sifirla:${ip}`, 4, 30 * 60 * 1000);
    if (!sinir.izin) {
      return Response.json(
        { hata: `Cok fazla istek. ${sinir.kalanDakika} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }

    const { eposta } = await request.json();
    const temizEposta = String(eposta || "").trim().toLowerCase();
    const kok = new URL(request.url).origin;

    await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: JSON.stringify({
        email: temizEposta,
        gotrue_meta_security: {},
      }),
      // Sifre yenileme baglantisinin donecegi adres
      // (Supabase panelinde Redirect URLs listesine eklenmeli)
    }).catch(() => {});

    // Hesabin var olup olmadigini ele vermemek icin her durumda ayni cevap
    return Response.json({
      tamam: true,
      mesaj:
        "Bu e-posta kayitliysa sifre yenileme baglantisi gonderildi. Gelen kutunu ve spam klasorunu kontrol et.",
    });
  } catch (err) {
    console.error("Sifre sifirlama hatasi:", err);
    return Response.json({
      tamam: true,
      mesaj: "Bu e-posta kayitliysa sifre yenileme baglantisi gonderildi.",
    });
  }
}
