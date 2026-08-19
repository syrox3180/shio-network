import { kullaniciAl } from "../../../../lib/oturum-sunucu";
import { kaynakGecerli, istekIp, hizSiniri, olayKaydet, discordUyari } from "../../../../lib/guvenlik";
import { yonetimIstek } from "../../../../lib/shopier";
import { rconKomut } from "../../../../lib/rcon";
import { urunBul, urunKomutlari, urunKategorisi, KATEGORI_ADI } from "../../../../lib/ayarlar";
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

    const urun = urunBul(esya.paket_id);
    const kategori = urunKategorisi(urun);

    // Rütbelerde süre var, kasa/kit/af tek kullanımlık ve süresiz
    const sureli = kategori === "rutbe";
    const sure = sureli ? urun?.sureGun || 30 : null;

    /* ---------- Elle işlenen ürünler (ör. blacklist affı) ---------- */
    /* Sunucuya komut gönderilmez; yetkiliye Discord'dan bildirilir. */
    if (urun?.elle) {
      await yonetimIstek(`envanter?id=eq.${esya.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          durum: "yetkili",
          nick: temizNick,
          etkinlestirme: new Date().toISOString(),
          bitis: null,
          hata_mesaji: null,
        }),
      });

      await olayKaydet("elle_islem_talebi", {
        kullaniciId: kullanici.id,
        eposta: kullanici.email,
        ip,
        detay: { nick: temizNick, urun: esya.paket_ad, kategori },
      });

      await discordUyari(
        "⚠️ Elle işlem gerekiyor",
        `**${temizNick}** oyuncusu **${esya.paket_ad}** ürününü etkinleştirdi.\n` +
          `Bu ürün otomatik verilmiyor — kara liste kaydını elle silmen gerekiyor.\n\n` +
          `Üye: ${kullanici.email}`,
        0xf0a63c
      );

      return Response.json({
        tamam: true,
        elle: true,
        kategori,
        mesaj:
          "Talebin yetkili ekibine iletildi. Discord'dan destek talebi açarsan işlem daha hızlı tamamlanır.",
      });
    }

    const komutlar = urunKomutlari(urun, temizNick);

    if (komutlar.length === 0) {
      return Response.json(
        { hata: "Bu ürün için teslimat komutu tanımlı değil. Yetkiliye bildir." },
        { status: 500 }
      );
    }

    // Sunucuya gönder
    let cevap = "";
    try {
      for (const komut of komutlar) {
        cevap = await rconKomut(komut);
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
        detay: { esyaId: esya.id, urun: esya.paket_ad, hata: err.message },
      });

      await discordUyari(
        "Ürün etkinleştirilemedi",
        `**${temizNick}** için **${esya.paket_ad}** verilemedi.\nSebep: ${err.message}\n\nOyun içinde elle vermen gerekiyor.`,
        0xed4245
      );

      return Response.json(
        {
          hata: "Sunucuya bağlanılamadı. Yetkili ekibi bilgilendirildi, ürünün en kısa sürede tanımlanacak.",
        },
        { status: 502 }
      );
    }

    const bitis = sureli
      ? new Date(Date.now() + sure * 24 * 60 * 60 * 1000).toISOString()
      : null;

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

    await olayKaydet("urun_etkinlestirildi", {
      kullaniciId: kullanici.id,
      eposta: kullanici.email,
      ip,
      detay: {
        nick: temizNick,
        urun: esya.paket_ad,
        kategori,
        sure,
        komutlar,
      },
    });

    await discordUyari(
      `${KATEGORI_ADI[kategori] || "Ürün"} etkinleştirildi`,
      `**${temizNick}** oyuncusuna **${esya.paket_ad}** verildi${sureli ? ` (${sure} gün)` : ""}.\n\`${komutlar.join("\n")}\``,
      0x5fbf8b
    );

    return Response.json({
      tamam: true,
      bitis,
      sure,
      kategori,
      cevap: String(cevap || "").slice(0, 200),
    });
  } catch (err) {
    console.error("Etkinlestirme hatasi:", err);
    return Response.json({ hata: "İşlem tamamlanamadı." }, { status: 500 });
  }
}
