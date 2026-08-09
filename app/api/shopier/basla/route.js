import {
  SHOPIER_ODEME_URL,
  SHOPIER_API_KEY,
  shopierAktif,
  imzaOlustur,
  yonetimIstek,
  kullaniciDogrula,
} from "../../../../lib/shopier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!shopierAktif) {
      return Response.json({ hata: "Shopier henüz yapılandırılmamış." }, { status: 503 });
    }

    const token = (request.headers.get("authorization") || "").replace("Bearer ", "");
    const kullanici = await kullaniciDogrula(token);
    if (!kullanici?.id) {
      return Response.json({ hata: "Önce giriş yapmalısın." }, { status: 401 });
    }

    const { siparisId } = await request.json();
    if (!siparisId) {
      return Response.json({ hata: "Sipariş bulunamadı." }, { status: 400 });
    }

    // Siparişi servis anahtarıyla oku ve gerçekten bu kullanıcıya ait mi doğrula
    const kayitlar = await yonetimIstek(`siparisler?select=*&id=eq.${Number(siparisId)}`);
    const siparis = kayitlar?.[0];

    if (!siparis || siparis.kullanici_id !== kullanici.id) {
      return Response.json({ hata: "Sipariş bulunamadı." }, { status: 404 });
    }
    if (siparis.odendi) {
      return Response.json({ hata: "Bu siparişin ödemesi zaten alınmış." }, { status: 409 });
    }
    if (siparis.durum !== "bekliyor") {
      return Response.json({ hata: "Bu sipariş artık ödenemez." }, { status: 409 });
    }

    const randomNr = String(Math.floor(100000 + Math.random() * 900000));
    const siparisNo = String(siparis.id);
    const tutar = Number(siparis.fiyat).toFixed(2);
    const paraBirimi = "0"; // 0 = TL

    const nick = siparis.nick || "Oyuncu";
    const eposta = siparis.eposta || kullanici.email || "";

    const alanlar = {
      API_key: SHOPIER_API_KEY,
      website_index: "1",
      platform_order_id: siparisNo,
      product_name: `${siparis.paket_ad} - ${nick}`,
      product_type: "1", // dijital ürün
      buyer_name: nick.slice(0, 30),
      buyer_surname: "Oyuncu",
      buyer_email: eposta,
      buyer_account_age: "0",
      buyer_id_nr: siparisNo,
      buyer_phone: "5000000000",
      billing_address: "Dijital teslimat",
      billing_city: "Istanbul",
      billing_country: "Turkiye",
      billing_postcode: "34000",
      shipping_address: "Dijital teslimat",
      shipping_city: "Istanbul",
      shipping_country: "Turkiye",
      shipping_postcode: "34000",
      total_order_value: tutar,
      currency: paraBirimi,
      platform: "0",
      is_in_frame: "0",
      current_language: "0",
      modul_version: "1.0.4",
      random_nr: randomNr,
    };

    alanlar.signature = imzaOlustur(randomNr, siparisNo, tutar, paraBirimi);

    return Response.json({ hedef: SHOPIER_ODEME_URL, alanlar });
  } catch (err) {
    console.error("Shopier basla hatası:", err);
    return Response.json({ hata: "Ödeme başlatılamadı." }, { status: 500 });
  }
}
