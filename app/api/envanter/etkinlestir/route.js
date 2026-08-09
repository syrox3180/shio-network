import { kullaniciAl } from "../../../../lib/oturum-sunucu";
import { kaynakGecerli, istekIp, hizSiniri, olayKaydet, discordUyari } from "../../../../lib/guvenlik";
import { yonetimIstek } from "../../../../lib/shopier";
import { rconKomut } from "../../../../lib/rcon";
import { PAKETLER, TESLIMAT } from "../../../../lib/ayarlar";
import { NICK_KURALI } from "../../../../lib/sifre";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!kaynakGecerli(request)) {
      return Response.json({ hata: "Geçersiz istek." }, { status: 403 });
    }

    const kullanici = await kullaniciAl();
    if (!kullanici?.id) {
      return Response.json({ hata: "Önce giriş yapmalısın." }, { status: 401 });
    }

    const ip = istekIp(request);
    const sinir = await hizSiniri(`etkinlestir:${kullanici.id}`, 10, 600, 10);
    if (!sinir.izin) {
      return Response.json(
        { hata: `Çok fazla deneme. ${sinir.kalanDakika} dakika sonra tekrar dene.` },
        { status: 429 }
      );
    }

    const { esyaId, nick } = await request.json();
    const temizNick = String(nick || "").trim();

    // Komut enjeksiyonuna karşı katı kontrol
    if (!NICK_KURALI.test(temizNick)) {
      return Response.json(
        { hata: "Nick 3-16 karakter olmalı ve sadece harf, rakam ve alt çizgi içerebilir." },
        { status: 400 }
      );
    }

    // Eşyayı servis anahtarıyla oku ve sahipliğini doğrula
    const kayitlar = await yonetimIstek(`envanter?select=*&id=eq.${Number(esyaId)}`);
    const esya = kayitlar?.[0];

    if (!esya || esya.kullanici_id !== kullanici.id) {
      return Response.json({ hata: "Eşya bulunamadı." }, { status: 404 });
    }
    if (esya.durum === "etkin") {
      return Response.json({ hata: "Bu paket zaten etkinleştirilmiş." }, { status: 409 });
    }

    const paket = PAKETLER.find((p) => p.id === esya.paket_id);
    const grup = paket?.oyunGrubu || esya.paket_id;
    const sure = paket?.sureGun || 30;

    const komut = TESLIMAT.komut
      .replaceAll("{nick}", temizNick)
      .replaceAll("{grup}", grup)
      .replaceAll("{sure}", String(sure));

    // Sunucuya gönder
    let cevap;
    try {
      cevap = await rconKomut(komut);

      for (const ek of TESLIMAT.ekKomutlar || []) {
        await rconKomut(
          ek.replaceAll("{nick}", temizNick).replaceAll("{grup}", grup).replaceAll("{sure}", String(sure))
        );
      }
    } catch (err) {
      await yonetimIstek(`envanter?id=eq.${esya.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ durum: "hata", nick: temizNick, hata_mesaji: err.message }),
      });

      await olayKaydet("etkinlestirme_hatasi", {
        kullaniciId: kullanici.id,
        eposta: kullanici.email,
        ip,
        detay: { esyaId: esya.id, hata: err.message },
      });

      await discordUyari(
        "Paket etkinleştirilemedi",
        `**${temizNick}** için **${esya.paket_ad}** verilemedi.\nSebep: ${err.message}\n\nOyun içinde elle vermen gerekiyor.`,
        0xed4245
      );

      return Response.json(
        {
          hata: "Sunucuya bağlanılamadı. Yetkili ekibi bilgilendirildi, paketin en kısa sürede tanımlanacak.",
        },
        { status: 502 }
      );
    }

    const bitis = new Date(Date.now() + sure * 24 * 60 * 60 * 1000).toISOString();

    await yonetimIstek(`envanter?id=eq.${esya.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        durum: "etkin",
        nick: temizNick,
        etkinlestirme: new Date().toISOString(),
        bitis,
        hata_mesaji: null,
      }),
    });

    await olayKaydet("paket_etkinlestirildi", {
      kullaniciId: kullanici.id,
      eposta: kullanici.email,
      ip,
      detay: { nick: temizNick, paket: esya.paket_ad, sure },
    });

    await discordUyari(
      "Paket etkinleştirildi",
      `**${temizNick}** oyuncusuna **${esya.paket_ad}** verildi (${sure} gün).`,
      0x5fbf8b
    );

    return Response.json({ tamam: true, bitis, sure, cevap: String(cevap || "").slice(0, 200) });
  } catch (err) {
    console.error("Etkinlestirme hatasi:", err);
    return Response.json({ hata: "İşlem tamamlanamadı." }, { status: 500 });
  }
}
