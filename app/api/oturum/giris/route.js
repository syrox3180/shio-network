import { authIstek, oturumuYaz, hataCevir, hizSiniri, istekIp } from "../../../../lib/oturum-sunucu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { eposta, sifre } = await request.json();
    const temizEposta = String(eposta || "").trim().toLowerCase();
    const ip = istekIp(request);

    // Hem IP hem hesap bazında sınır:
    // tek hesaba yapılan saldırı da, bir IP'den toplu deneme de engellenir
    const ipSinir = hizSiniri(`giris-ip:${ip}`, 15, 10 * 60 * 1000);
    const hesapSinir = hizSiniri(`giris-hesap:${temizEposta}`, 6, 10 * 60 * 1000);

    if (!ipSinir.izin || !hesapSinir.izin) {
      const kalan = !hesapSinir.izin ? hesapSinir.kalanDakika : ipSinir.kalanDakika;
      return Response.json(
        { hata: `Çok fazla hatalı deneme. ${kalan} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }

    const { ok, veri } = await authIstek("token?grant_type=password", {
      email: temizEposta,
      password: sifre,
    });

    if (!ok) {
      return Response.json(
        { hata: hataCevir(veri.msg || veri.error_description || veri.message) },
        { status: 401 }
      );
    }

    oturumuYaz(veri);
    return Response.json({ tamam: true });
  } catch (err) {
    console.error("Giriş hatası:", err);
    return Response.json({ hata: "Giriş yapılamadı." }, { status: 500 });
  }
}
