import { authIstek, oturumuYaz, hataCevir, hizSiniri, istekIp } from "../../../../lib/oturum-sunucu";
import { sifreKontrol, nickKontrol } from "../../../../lib/sifre";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request) {
  try {
    const ip = istekIp(request);
    const sinir = hizSiniri(`kayit:${ip}`, 5, 60 * 60 * 1000);
    if (!sinir.izin) {
      return Response.json(
        { hata: `Çok fazla kayıt denemesi. ${sinir.kalanDakika} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }

    const { eposta, sifre, nick } = await request.json();
    const temizNick = String(nick || "").trim();
    const temizEposta = String(eposta || "").trim().toLowerCase();

    const nickHatasi = nickKontrol(temizNick);
    if (nickHatasi) return Response.json({ hata: nickHatasi }, { status: 400 });

    const sifreHatasi = sifreKontrol(sifre, { nick: temizNick, eposta: temizEposta });
    if (sifreHatasi) return Response.json({ hata: sifreHatasi }, { status: 400 });

    // Nick başkasında kayıtlı mı
    const kontrol = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nick_musait`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: JSON.stringify({ p_nick: temizNick }),
    }).catch(() => null);

    if (kontrol?.ok) {
      const musait = await kontrol.json().catch(() => true);
      if (musait === false) {
        return Response.json({ hata: "Bu nick başka bir hesapta kayıtlı." }, { status: 409 });
      }
    }

    const { ok, veri } = await authIstek("signup", {
      email: temizEposta,
      password: sifre,
      data: { nick: temizNick },
    });

    if (!ok) {
      return Response.json(
        { hata: hataCevir(veri.msg || veri.error_description || veri.message) },
        { status: 400 }
      );
    }

    if (veri.access_token) {
      oturumuYaz(veri);
      return Response.json({ tamam: true, girisYapildi: true });
    }

    return Response.json({
      tamam: true,
      girisYapildi: false,
      mesaj:
        "Hesabın oluşturuldu. E-postana gelen doğrulama bağlantısına tıkla, sonra giriş yapabilirsin.",
    });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    return Response.json({ hata: "Kayıt tamamlanamadı." }, { status: 500 });
  }
}
