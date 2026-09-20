import { authIstek, oturumuYaz, hataCevir, kullaniciAl } from "../../../../lib/oturum-sunucu";
import {
  kaynakGecerli, istekIp, hizSiniri, sayaciSifirla,
  olayKaydet, discordUyari, girisKaydet, turnstileDogrula, turnstileAktif,
} from "../../../../lib/guvenlik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!kaynakGecerli(request)) {
      return Response.json({ hata: "Gecersiz istek." }, { status: 403 });
    }

    const { eposta, sifre, turnstile } = await request.json();
    const temizEposta = String(eposta || "").trim().toLowerCase();
    const ip = istekIp(request);

    if (turnstileAktif && !(await turnstileDogrula(turnstile, ip))) {
      return Response.json({ hata: "Guvenlik dogrulamasi basarisiz. Sayfayi yenile." }, { status: 400 });
    }

    // Hem IP hem hesap bazinda sinir
    const [ipSinir, hesapSinir] = await Promise.all([
      hizSiniri(`giris-ip:${ip}`, 20, 900, 15),
      hizSiniri(`giris-hesap:${temizEposta}`, 6, 900, 15),
    ]);

    if (!ipSinir.izin || !hesapSinir.izin) {
      const kalan = !hesapSinir.izin ? hesapSinir.kalanDakika : ipSinir.kalanDakika;
      await olayKaydet("giris_kilitlendi", { eposta: temizEposta, ip });
      if (!hesapSinir.izin) {
        await discordUyari(
          "Hesap kilitlendi",
          `**${temizEposta}** hesabina cok fazla hatali giris denemesi yapildi.\nIP: \`${ip}\``,
          0xed4245
        );
      }
      return Response.json(
        { hata: `Cok fazla hatali deneme. ${kalan} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }

    const { ok, veri } = await authIstek("token?grant_type=password", {
      email: temizEposta,
      password: sifre,
    });

    if (!ok) {
      await olayKaydet("giris_basarisiz", { eposta: temizEposta, ip });
      return Response.json(
        { hata: hataCevir(veri.msg || veri.error_description || veri.message) },
        { status: 401 }
      );
    }

    oturumuYaz(veri);

    // Basarili girisin ardindan sayaclari temizle
    await Promise.all([
      sayaciSifirla(`giris-hesap:${temizEposta}`),
      sayaciSifirla(`giris-ip:${ip}`),
    ]);

    // Yeni bir yerden giris mi
    const kullaniciId = veri.user?.id;
    if (kullaniciId) {
      const yeniYer = await girisKaydet(kullaniciId, ip);
      await olayKaydet(yeniYer ? "giris_yeni_konum" : "giris_basarili", {
        kullaniciId,
        eposta: temizEposta,
        ip,
      });
      if (yeniYer) {
        await discordUyari(
          "Yeni konumdan giris",
          `**${temizEposta}** hesabina daha once gorulmemis bir baglantidan giris yapildi.`,
          0x4fa8de
        );
      }
    }

    return Response.json({ tamam: true });
  } catch (err) {
    console.error("Giris hatasi:", err);
    return Response.json({ hata: "Giris yapilamadi." }, { status: 500 });
  }
}
