// =======================================================
//   ⚙️  TÜM AYARLAR BU DOSYADA
//   Siteyi değiştirmek istediğinde sadece burayı düzenle.
// =======================================================

export const SUNUCU = {
  ad: "Shio Network",
  kisaAd: "SHIO",
  slogan: "Türkiye'nin boxmining sunucusu",
  aciklama:
    "Kendi kutunu kur, madenini kaz, kazandığını markette sat ve sıralamada yüksel. Sürüm 1.8 – 1.21 arası tüm istemcilerle oynanır.",

  // Oyuncuların bağlanacağı adres
  adres: "play.shionetwork.com.tr",

  // Sunucu durumu sorgusu için adres (port varsayılan değilse "adres:port" yaz)
  sorguAdresi: "play.shionetwork.com.tr",

  surum: "1.8 – 1.21",
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
    satinAlLinki: "",
    ayricaliklar: [
      "Sohbette VIP etiketi",
      "Renkli sohbet yazma",
      "özel maden",
      "/kit vip — 24 saatte bir",
      "Özel ilgi ",
    ],
  },
  {
    id: "mvp",
    ad: "MVP",
    fiyat: 150,
    renk: "#4FA8DE",
    ozet: "Ekonomide öne geçmek isteyenler için",
    satinAlLinki: "",
    devami: "VIP",
    ayricaliklar: [
      "oyunda özel etiket",
      "/kit mvp — 12 saatte bir",
      "renkli yazma",
      "fazladan /pv",
      "Discord'da MVP rolü",
    ],
  },
  {
    id: "svip",
    ad: "SVIP",
    fiyat: 250,
    renk: "#9D5CFF",
    ozet: "Ciddi oynayanların paketi",
    satinAlLinki: "",
    devami: "MVP",
    ayricaliklar: [
      "oyunda özel etiket",
      "/kit svip — 8 saatte bir",
      "özel renkli yazı",
      "discordda özel rol",
      "fazladan /pv ",
    ],
  },
  {
    id: "sponsor",
    ad: "SPONSOR",
    fiyat: 300,
    renk: "#F0A63C",
    ozet: "Sunucudaki en üst seviye",
    satinAlLinki: "",
    devami: "SVIP",
    oneCikan: true,
    ayricaliklar: [
      "özel oyun içi tagı",
      "/kit sponsor — 6 saatte bir",
      "özel renkli yazı",
      "fazladan /pv",
      "Sunucu dolu olsa bile giriş hakkı",
      "Haftada 2 özel kasa anahtarı",
      "Discord'da Sponsor rolü",
    ],
  },
];

// -------------------------------------------------------
//   🎮 ANA SAYFA ÖZELLİK KARTLARI
// -------------------------------------------------------
export const OZELLIKLER = [
  {
    baslik: "Kendi kutun",
    metin:
      "Herkesin kendine ait bir kutusu var. İçindeki madenler kazdıkça yenilenir, kimse senin alanına giremez.",
  },
  {
    baslik: "Yükseltme sistemi",
    metin:
      "Kazandığın parayla kutunu yükselt. Her seviyede daha değerli cevherler açılır, kazma hızın artar.",
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
