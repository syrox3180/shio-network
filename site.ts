// Sunucunun tek ayar dosyasi. Burayi degistirince tum site degisir.
export const site = {
  name: "SHIO NETWORK",
  shortName: "SHIO",
  tagline: "Kaz. Sat. Yüksel.",
  mode: "BoxMining",
  ip: "play.shionetwork.com.tr",
  version: "1.20 ve üstü tüm sürümler",
  region: "Türkiye",
  discord: "https://discord.gg/degistir",

  // Odeme bilgileri: siparis olusturulunca oyuncuya bu bilgiler gosterilir.
  payment: {
    title: "Papara / IBAN",
    account: "TR00 0000 0000 0000 0000 0000 00",
    holder: "Ad Soyad",
    note: "Açıklama kısmına sipariş numaranı yaz. Ödeme onaylanınca paketin oyun içi hesabına tanımlanır.",
  },

  rules: [
    {
      title: "Hile yok",
      body: "Killaura, reach, autoclicker, X-ray ve benzeri her türlü yardımcı yazılım kalıcı yasak sebebi.",
    },
    {
      title: "Bug kullanma, bildir",
      body: "Duplicate veya ekonomi açığı bulursan Discord'dan ticket aç. Bildiren ödüllendirilir, kullanan sıfırlanır.",
    },
    {
      title: "Hakaret ve reklam",
      body: "Sohbette küfür, aile üzerinden hakaret ve başka sunucu reklamı susturma ile sonuçlanır.",
    },
    {
      title: "Hesap paylaşımı",
      body: "Hesabını paylaşırsan sonuçlarından sen sorumlusun. Çalınan eşya geri verilmez.",
    },
  ],
};

export const orderStatus = {
  pending: { label: "Ödeme bekleniyor", tone: "wait" },
  paid: { label: "Ödeme alındı", tone: "ok" },
  delivered: { label: "Teslim edildi", tone: "done" },
  cancelled: { label: "İptal edildi", tone: "off" },
} as const;

export type OrderStatus = keyof typeof orderStatus;
