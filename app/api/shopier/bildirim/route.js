import { imzaDogrula, shopierAktif, yonetimIstek } from "../../../../lib/shopier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Ödeme sonrası kullanıcıyı sonuç sayfasına gönderen küçük HTML */
function yonlendir(durum, siparisNo) {
  const adres = `/odeme-sonuc?durum=${durum}${siparisNo ? `&no=${encodeURIComponent(siparisNo)}` : ""}`;
  return new Response(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8">
     <meta http-equiv="refresh" content="0;url=${adres}">
     <title>Yönlendiriliyor…</title></head>
     <body style="background:#0c0a12;color:#ede9f5;font-family:sans-serif;padding:40px">
     Yönlendiriliyor… <a href="${adres}" style="color:#9d5cff">Devam et</a>
     </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function POST(request) {
  let siparisNo = null;

  try {
    if (!shopierAktif) return yonlendir("hata");

    // Shopier form-urlencoded gönderir
    const form = await request.formData();
    const veri = Object.fromEntries(form.entries());

    siparisNo = veri.platform_order_id || null;

    // 1) İmza doğrulaması — bu olmadan hiçbir şey yapılmaz
    if (!imzaDogrula(veri)) {
      console.error("Shopier: imza doğrulanamadı", { siparisNo });
      return yonlendir("hata", siparisNo);
    }

    // 2) Ödeme başarılı mı
    const durum = String(veri.status || "").toLowerCase();
    if (durum !== "success") {
      return yonlendir("basarisiz", siparisNo);
    }

    // 3) Siparişi bul
    const kayitlar = await yonetimIstek(`siparisler?select=*&id=eq.${Number(siparisNo)}`);
    const siparis = kayitlar?.[0];
    if (!siparis) {
      console.error("Shopier: sipariş bulunamadı", siparisNo);
      return yonlendir("hata", siparisNo);
    }

    // 4) Zaten işlendiyse tekrar işleme (çift kredi yüklemeyi önler)
    if (siparis.odendi) {
      return yonlendir("basarili", siparisNo);
    }

    // 5) Tutar gerçekten eşleşiyor mu
    const odenen = Math.round(Number(veri.total_order_value || 0));
    if (odenen !== Math.round(Number(siparis.fiyat))) {
      console.error("Shopier: tutar uyuşmuyor", { siparisNo, odenen, beklenen: siparis.fiyat });
      return yonlendir("hata", siparisNo);
    }

    // 6) İşle
    const guncelleme = {
      odendi: true,
      shopier_odeme_id: String(veri.payment_id || `${siparisNo}-${Date.now()}`),
      odeme_tarihi: new Date().toISOString(),
      guncelleme: new Date().toISOString(),
    };

    // Kredi siparişiyse anında teslim et — tetikleyici krediyi otomatik yükler.
    // VIP paketiyse "ödendi" işaretlenir, rütbeyi yetkili oyun içinde verir.
    if (siparis.tur === "kredi") {
      guncelleme.durum = "teslim";
    }

    await yonetimIstek(`siparisler?id=eq.${Number(siparisNo)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(guncelleme),
    });

    return yonlendir("basarili", siparisNo);
  } catch (err) {
    console.error("Shopier bildirim hatası:", err);
    return yonlendir("hata", siparisNo);
  }
}

/* Shopier bazen GET ile de yoklama yapabiliyor */
export async function GET() {
  return yonlendir("bilinmiyor");
}
