// =======================================================
//   ⚙️  TÜM AYARLAR BU DOSYADA
//   Siteyi değiştirmek istediğinde sadece burayı düzenle.
// =======================================================

export const SUNUCU = {
  ad: "Shio Network",
  kisaAd: "SHIO",
  slogan: "Türkiye'nin boxmining sunucusu",
  aciklama:
    "Sunucuya katıl, madenlerini kaz, /warp takas'tan onları dönüştür ve maceraya sen de katıl.",

  // Oyuncuların bağlanacağı adres
  adres: "play.shionetwork.com.tr",

  // Sunucu durumu sorgusu için adres (port varsayılan değilse "adres:port" yaz)
  sorguAdresi: "play.shionetwork.com.tr",

  surum: "1.20 üstü tüm sürümler",
  discord: "https://discord.gg/m8JtBprwuc",
};

// -------------------------------------------------------
//   💎 VIP PAKETLERİ
//   satinAlLinki: Shopier ürün linkini buraya yapıştır.
//   Boş bırakırsan buton Discord'a yönlendirir.
// -------------------------------------------------------
export const PAKETLER = [
  {
    id: "vip",
    ad: "VIP",
    fiyat: 75,
    renk: "#5FBF8B",
    ozet: "Başlangıç için ihtiyacın olan her şey",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706853", // 👉 VIP ürününün Shopier linki
    ayricaliklar: [
      "Sohbette VIP etiketi",
      "Renkli sohbet yazma",
      "Ekstra /pv",
      "/kit vip — 24 saatte bir",
    ],
  },
  {
    id: "mvp",
    ad: "MVP",
    fiyat: 150,
    renk: "#4FA8DE",
    ozet: "Ekonomide öne geçmek isteyenler için",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706862", // 👉 MVP ürününün Shopier linki
    devami: "VIP",
    ayricaliklar: ["Ekstra /pv", "/kit mvp — 12 saatte bir"],
  },
  {
    id: "svip",
    ad: "SVIP",
    fiyat: 250,
    renk: "#9D5CFF",
    ozet: "Ciddi oynayanların paketi",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706875", // 👉 SVIP ürününün Shopier linki
    devami: "MVP",
    ayricaliklar: ["Ekstra /pv", "/kit svip — 8 saatte bir"],
  },
  {
    id: "sponsor",
    ad: "SPONSOR",
    fiyat: 300,
    renk: "#F0A63C",
    ozet: "Sunucudaki en üst seviye",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706901", // 👉 SPONSOR ürününün Shopier linki
    devami: "SVIP",
    oneCikan: true,
    ayricaliklar: [
      "Ekstra /pv",
      "/kit sponsor — 6 saatte bir",
      "Özel hizmet",
      "Özel isim rengi seçimi",
      "Sunucu dolu olsa bile giriş hakkı",
      "Haftada 2 özel kasa anahtarı",
      "Discord'da Sponsor rolü",
    ],
  },
];


// -------------------------------------------------------
//   🪙 KREDİ PAKETLERİ
//   1 kredi = 1 ₺ değerindedir.
//   satinAlLinki: Shopier ürün linkini buraya yapıştır.
//   Fiyat veya kredi miktarını değiştirirsen Supabase'deki
//   "kredi_paketleri" tablosunu da güncellemen gerekir.
// -------------------------------------------------------
export const KREDI_PAKETLERI = [
  {
    id: "k50",
    kredi: 50,
    bonus: 0,
    fiyat: 50,
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706980", // 👉 50 kredi ürününün Shopier linkini buraya yapıştır
  },
];

// -------------------------------------------------------
//   🎮 ANA SAYFA ÖZELLİK KARTLARI
// -------------------------------------------------------
export const OZELLIKLER = [
  {
    baslik: "Özel kılıçlar",
    metin: "Sunucuya özel, kendi özellikleri olan kılıçlar seni bekliyor.",
  },
  {
    baslik: "Yükseltme sistemi",
    metin: "Mağazadan VIP alarak seviyeni yükselt, yeni ayrıcalıkların kilidini aç.",
  },
  {
    baslik: "Oyuncu marketi",
    metin:
      "Fiyatı sen belirle, ilanını aç, sat. Ekonomi tamamen oyuncuların elinde şekilleniyor.",
  },
  {
    baslik: "Kasalar ve sıralama",
    metin:
      "Haftalık kasa açılışları ve ilk 10 sıralaması. En çok kazan, tabelada ismin kalsın.",
  },
];

// -------------------------------------------------------
//   🔐 ÜYELİK SİSTEMİ (Supabase)
//   Kurmadıysan site yine çalışır, sadece kayıt/giriş kapalı görünür.
//   Kurulum için README.md dosyasına bak.
// -------------------------------------------------------
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const uyelikAktif = Boolean(SUPABASE_URL && SUPABASE_KEY);

// -------------------------------------------------------
//   💳 SHOPIER OTOMATİK ÖDEME
//   Vercel'de SHOPIER_API_KEY ve SHOPIER_API_SECRET tanımlıysa
//   ödemeler otomatik alınır. Kurulum için README.md'ye bak.
// -------------------------------------------------------
export const shopierAktif = process.env.NEXT_PUBLIC_SHOPIER_AKTIF === "1";
