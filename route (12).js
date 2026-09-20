import { kaynakGecerli, istekIp, hizSiniri, olayKaydet } from "../../../../lib/guvenlik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    if (!kaynakGecerli(request)) {
      return Response.json({ hata: "Gecersiz istek." }, { status: 403 });
    }

    const ip = istekIp(request);
    const sinir = await hizSiniri(`sifirla:${ip}`, 4, 1800, 30);
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

    await olayKaydet("sifre_sifirlama_istegi", { eposta: temizEposta, ip });

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
