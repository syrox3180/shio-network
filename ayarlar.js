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
//   🎮 OYUN MODLARI (SUNUCULAR)
//   Oyuncu sandıkta bir ürünü etkinleştirirken hangi sunucuya
//   gönderileceğini buradaki id'lerden seçer. Şu an tek sunucu var:
//   GenPvP (RCON bağlantısı için bkz. lib/rcon.js).
// -------------------------------------------------------
export const OYUN_MODLARI = [{ id: "genpvp", ad: "GenPvP" }];

// Eski kayıtlarda görünmeye devam eden, artık kullanılmayan sunucular.
// Sadece geçmiş sandık kayıtlarının adı doğru yazılsın diye duruyor.
const ESKI_MODLAR = [
  { id: "boxmining", ad: "Boxmining" },
  { id: "prac", ad: "Prac" },
];

export function modAdi(id) {
  return (
    [...OYUN_MODLARI, ...ESKI_MODLAR].find((m) => m.id === id)?.ad || id || "—"
  );
}

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
    oyunGrubu: "vip",
    sureGun: 30,
    renk: "#5FBF8B",
    ozet: "Başlangıç için ihtiyacın olan her şey",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50771116", // 👉 VIP ürününün Shopier linki
    ayricaliklar: [
      "Sohbette VIP etiketi",
      "Renkli sohbet yazma",
      "Ekstra /pv",
      "/kit vip — 7 günde bir",
    ],
  },
  {
    id: "mvp",
    ad: "MVP",
    fiyat: 150,
    oyunGrubu: "mvp",
    sureGun: 30,
    renk: "#4FA8DE",
    ozet: "Ekonomide öne geçmek isteyenler için",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50771089", // 👉 MVP ürününün Shopier linki
    devami: "VIP",
    ayricaliklar: ["Ekstra /pv", "/kit mvp — 7 günde 1"],
  },
  {
    id: "sponsor",
    ad: "SPONSOR",
    fiyat: 300,
    oyunGrubu: "sponsor",
    sureGun: 30,
    renk: "#F0A63C",
    ozet: "Sunucudaki en üst seviye",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50771034", // 👉 SPONSOR ürününün Shopier linki
    devami: "MVP",
    oneCikan: true,
    ayricaliklar: [
      "Ekstra /pv",
      "/kit sponsor — 7 günde 1",
      "Özel hizmet",
      "Özel isim rengi seçimi",
      "Sunucu dolu olsa bile giriş hakkı",
      "Haftada 2 özel kasa anahtarı",
      "Discord'da Sponsor rolü",
    ],
  },
  {
    id: "raidalert",
    ad: "Raid Alert",
    fiyat: 100,
    kategori: "hizmet",
    renk: "#EF5A6F",
    ozet: "Üssüne baskın olduğunda haberin olsun",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50771141", // Raid Alert
    // Bu ürün sunucuya komut GÖNDERMEZ.
    // Oyuncu sandıktan etkinleştirince Discord'a bildirim düşer,
    // teslimatı yetkili elle yapar.
    elle: true,
    elleNot: "Raid Alert'i oyun içinde elle tanımlaman gerekiyor.",
    komutlar: [],
    ayricaliklar: [
      "Raid Alert bildirimi",
      "Yetkili tarafından elle teslim edilir",
      "Etkinleştirince Discord'dan destek talebi aç",
    ],
  },
];


// -------------------------------------------------------
//   ⚖️ UNBAN & BLACKLIST AFFI
//   Unban etkinleştirilince ceza otomatik kalkar.
//   Blacklist affı ise elle işlenir (elle: true).
//   Sunucunda LiteBans yerine başka eklenti varsa
//   aşağıdaki komutları ona göre değiştir.
// -------------------------------------------------------
export const AFLAR = [
  {
    id: "af_unban",
    ad: "Unban",
    fiyat: 250, // 👈
    kategori: "af",
    renk: "#5FBF8B",
    ozet: "Ban cezan anında kalkar",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50048133",
    komutlar: ["unban {nick}"],
    ayricaliklar: [
      "Ban cezası kaldırılır",
      "Sandıktan etkinleştirdiğin an uygulanır",
      "Yetkili beklemene gerek yok",
    ],
  },
  {
    id: "af_blacklist",
    ad: "Blacklist Affı",
    fiyat: 400, // 👈
    kategori: "af",
    renk: "#EF5A6F",
    ozet: "Kara liste kaydın yetkili tarafından silinir",
    satinAlLinki: "https://www.shopier.com/ShioNetWork/50048143",
    oneCikan: true,
    // Bu ürün sunucuya komut GÖNDERMEZ.
    // Oyuncu sandıktan etkinleştirince Discord'a bildirim düşer,
    // işlemi yetkili elle yapar.
    elle: true,
    elleNot: "Kara liste kaydını elle silmen gerekiyor.",
    komutlar: [],
    ayricaliklar: [
      "Kara liste kaydı yetkili tarafından silinir",
      "Etkinleştirince Discord'dan destek talebi aç",
      "Genelde birkaç saat içinde tamamlanır",
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
    satinAlLinki: "https://www.shopier.com/ShioNetWork/49706980", // 👉 50 kredi ürününün Shopier linki
  },
];


// -------------------------------------------------------
//   📦 OYUN İÇİ TESLİMAT
//   Sandıktan etkinleştirilen paket için sunucuya
//   gönderilecek komut. {nick} {grup} {sure} otomatik dolar.
//
//   LuckPerms kullanıyorsan aşağıdaki hazır. Başka bir
//   yetki eklentisi varsa komutu ona göre değiştir.
//   Süresiz vermek istersen: "lp user {nick} parent add {grup}"
// -------------------------------------------------------
export const TESLIMAT = {
  // Rütbe (VIP/MVP/SPONSOR) için varsayılan komut
  komut: "lp user {nick} parent addtemp {grup} {sure}d",
  // Her etkinleştirmeden sonra ayrıca çalıştırılacak komutlar (isteğe bağlı)
  ekKomutlar: [],
};

// -------------------------------------------------------
//   📚 TÜM ÜRÜNLER TEK LİSTEDE
//   Sandık ve teslimat bu listeyi kullanır.
// -------------------------------------------------------
export const TUM_URUNLER = [...PAKETLER, ...AFLAR];

export function urunBul(id) {
  return TUM_URUNLER.find((u) => u.id === id) || null;
}

export const KATEGORI_ADI = {
  rutbe: "Rütbe",
  af: "Af",
  hizmet: "Hizmet",
};

export function urunKategorisi(urun) {
  return urun?.kategori || "rutbe";
}

/*
  Bir ürün için sunucuya gönderilecek komutları hazırlar.
  Nick'in güvenli olduğu (NICK_KURALI) çağrıdan önce doğrulanmış olmalı.
*/
export function urunKomutlari(urun, nick) {
  if (!urun) return [];

  const doldur = (kalip) =>
    String(kalip)
      .replaceAll("{nick}", nick)
      .replaceAll("{grup}", urun.oyunGrubu || urun.id)
      .replaceAll("{sure}", String(urun.sureGun || 30))
      .replaceAll("{kasa}", urun.kasaAdi || "")
      .replaceAll("{kit}", urun.kitAdi || "")
      .replaceAll("{adet}", String(urun.adet || 1))
      .trim();

  const liste =
    urun.komutlar && urun.komutlar.length ? [...urun.komutlar] : [TESLIMAT.komut];

  // Ek komutlar sadece rütbelerde çalışsın
  if (urunKategorisi(urun) === "rutbe") {
    liste.push(...(TESLIMAT.ekKomutlar || []));
  }

  return liste.map(doldur).filter(Boolean);
}

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
